import { supabaseAdmin } from '../config/supabase.js';

/**
 * Debug script to check series in database
 * Usage: node src/scripts/checkSeries.js
 */

async function checkSeries() {
  console.log('🔍 Checking series in database...\n');

  try {
    // 1. Check all content with type 'series'
    console.log('📺 SERIES IN DATABASE:');
    console.log('=' .repeat(80));
    
    const { data: seriesList, error: seriesError } = await supabaseAdmin
      .from('content')
      .select('*')
      .eq('content_type', 'series')
      .order('created_at', { ascending: false });

    if (seriesError) {
      console.error('Error fetching series:', seriesError);
      return;
    }

    if (!seriesList || seriesList.length === 0) {
      console.log('❌ No series found in database!');
      console.log('\n💡 To add series:');
      console.log('   1. Make sure GOOGLE_DRIVE_SERIES_FOLDER_ID is set in .env');
      console.log('   2. Run: POST /api/sync/series');
      console.log('   3. Or use Admin Panel → Sync Series button');
      return;
    }

    console.log(`✅ Found ${seriesList.length} series\n`);

    for (const series of seriesList) {
      console.log(`\n📺 ${series.title}`);
      console.log(`   ID: ${series.id}`);
      console.log(`   Seasons: ${series.total_seasons || 0}`);
      console.log(`   Episodes: ${series.total_episodes || 0}`);
      console.log(`   Genres: ${series.genres ? series.genres.join(', ') : 'None'}`);
      console.log(`   Poster: ${series.poster_url ? '✅' : '❌'}`);
      console.log(`   Created: ${new Date(series.created_at).toLocaleString()}`);

      // Check seasons for this series
      const { data: seasons, error: seasonsError } = await supabaseAdmin
        .from('seasons')
        .select('*')
        .eq('content_id', series.id)
        .order('season_number', { ascending: true });

      if (seasonsError) {
        console.error('   ❌ Error fetching seasons:', seasonsError);
        continue;
      }

      if (!seasons || seasons.length === 0) {
        console.log('   ⚠️  WARNING: No seasons found!');
        continue;
      }

      console.log(`   \n   📁 Seasons (${seasons.length}):`);

      for (const season of seasons) {
        // Count episodes for this season
        const { count: episodeCount, error: countError } = await supabaseAdmin
          .from('episodes')
          .select('id', { count: 'exact', head: true })
          .eq('season_id', season.id);

        if (countError) {
          console.error(`      ❌ Error counting episodes:`, countError);
          continue;
        }

        console.log(`      Season ${season.season_number}: ${episodeCount || 0} episodes`);

        // Show first 3 episodes
        if (episodeCount > 0) {
          const { data: episodes, error: episodesError } = await supabaseAdmin
            .from('episodes')
            .select('episode_number, title, google_drive_file_id')
            .eq('season_id', season.id)
            .order('episode_number', { ascending: true })
            .limit(3);

          if (!episodesError && episodes) {
            episodes.forEach(ep => {
              console.log(`         E${ep.episode_number}: ${ep.title} ${ep.google_drive_file_id ? '✅' : '❌'}`);
            });
            if (episodeCount > 3) {
              console.log(`         ... and ${episodeCount - 3} more episodes`);
            }
          }
        }
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n✅ Check complete!');

    // Summary
    console.log('\n📊 SUMMARY:');
    const totalSeasons = seriesList.reduce((sum, s) => sum + (s.total_seasons || 0), 0);
    const totalEpisodes = seriesList.reduce((sum, s) => sum + (s.total_episodes || 0), 0);
    console.log(`   Series: ${seriesList.length}`);
    console.log(`   Total Seasons: ${totalSeasons}`);
    console.log(`   Total Episodes: ${totalEpisodes}`);

    // Check for issues
    console.log('\n⚠️  POTENTIAL ISSUES:');
    let issuesFound = false;

    seriesList.forEach(series => {
      if (!series.total_seasons || series.total_seasons === 0) {
        console.log(`   ❌ "${series.title}" has 0 seasons`);
        issuesFound = true;
      }
      if (!series.total_episodes || series.total_episodes === 0) {
        console.log(`   ❌ "${series.title}" has 0 episodes`);
        issuesFound = true;
      }
      if (!series.poster_url) {
        console.log(`   ⚠️  "${series.title}" has no poster`);
      }
    });

    if (!issuesFound) {
      console.log('   ✅ No critical issues found!');
    } else {
      console.log('\n💡 To fix issues with 0 seasons/episodes:');
      console.log('   1. Re-run sync: POST /api/sync/series');
      console.log('   2. Check Google Drive folder structure');
      console.log('   3. Check server logs for parsing errors');
    }

  } catch (error) {
    console.error('❌ Error:', error);
    console.error(error.stack);
  } finally {
    process.exit(0);
  }
}

checkSeries();
