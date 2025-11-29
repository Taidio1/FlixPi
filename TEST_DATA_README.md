# FlixPi - Tryb Testowy

Ten dokument opisuje jak używać wersji developerskiej FlixPi z testową bazą danych zawierającą 3 filmy i 2 seriale z odcinkami.

## Uruchomienie w trybie testowym

### Metoda 1: Skrypt npm (Zalecane)

**Uruchomienie frontend + backend z danymi testowymi:**
```bash
npm run dev:test
```

**Tylko backend:**
```bash
cd server
npm run dev:test
```

### Metoda 2: Zmienna środowiskowa (Alternatywa)

**Windows (PowerShell):**
```powershell
$env:USE_TEST_DATA="true"
cd server
npm run dev
```

**Linux/Mac:**
```bash
export USE_TEST_DATA=true
cd server
npm run dev
```

## Zawartość testowych danych

### Filmy:
1. **Matrix** (1999) - Action, Sci-Fi, Thriller
2. **Inception** (2010) - Action, Sci-Fi, Thriller  
3. **Pulp Fiction** (1994) - Crime, Thriller, Drama

### Serial 1: Breaking Bad
- **Sezon 1**: 3 odcinki
  - Odcinek 1: "Pilot"
  - Odcinek 2: "Cat's in the Bag..."
  - Odcinek 3: "...And the Bag's in the River"
- **Sezon 2**: 1 odcinek
  - Odcinek 1: "Seven Thirty-Seven"

### Serial 2: Game of Thrones
- **Sezon 1**: 2 odcinki
  - Odcinek 1: "Winter Is Coming"
  - Odcinek 2: "The Kingsroad"

## Jak to działa?

Gdy `USE_TEST_DATA=true`, aplikacja:
1. NIE łączy się z Supabase
2. Używa pliku `server/src/data/test-data.json` jako źródła danych
3. Zwraca dane testowe zamiast rzeczywistych danych z bazy

## Przywracanie normalnego trybu

Aby wrócić do normalnego trybu (z połączeniem do Supabase):
1. Usuń lub zmień na `false` zmienną `USE_TEST_DATA`
2. Upewnij się, że masz skonfigurowane połączenie Supabase w `.env`
3. Uruchom serwer ponownie

```bash
# Wyłączenie trybu testowego
# Windows PowerShell:
$env:USE_TEST_DATA="false"

# Linux/Mac:
export USE_TEST_DATA=false
```

## Edycja danych testowych

Dane testowe znajdują się w pliku:
```
server/src/data/test-data.json
```

Możesz edytować ten plik, aby dodać więcej filmów, seriali lub odcinków według schematu:

```json
{
  "content": [...],  // Filmy i seriale
  "seasons": [...],   // Sezony
  "episodes": [...]   // Odcinki
}
```

**UWAGA:** Zmiany w pliku testowym wymagają restartu serwera!

