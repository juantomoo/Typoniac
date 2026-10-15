#!/usr/bin/env python3
"""
Pipeline de descarga y normalización de canciones curadas para Typoniac.
Utiliza yt-dlp con emulación android y ffmpeg para obtener clips de práctica de 75s
normalizados a -16 LUFS para evitar picos de volumen en niños.
"""

import os
import subprocess
import json

TRACKS = [
    {
        "id": "c418_subwoofer",
        "title": "Subwoofer Lullaby",
        "artist": "C418",
        "query": "ytsearch1:C418 Subwoofer Lullaby official",
        "bpm": 70,
        "offset": 0.0,
        "duration": 75,
        "level": 1,
        "age": "5-7 años",
        "description": "Fase Cognitiva - Hilera Guía central (A-S-D-F / J-K-L-Ñ)"
    },
    {
        "id": "mario_dire_docks",
        "title": "Dire, Dire Docks",
        "artist": "Koji Kondo",
        "query": "ytsearch1:Dire Dire Docks Super Mario 64 OST",
        "bpm": 80,
        "offset": 0.0,
        "duration": 75,
        "level": 1,
        "age": "5-7 años",
        "description": "Fase Cognitiva - Arpegios acuáticos y anclaje F y J"
    },
    {
        "id": "totoro_theme",
        "title": "My Neighbor Totoro",
        "artist": "Joe Hisaishi",
        "query": "ytsearch1:My Neighbor Totoro instrumental Joe Hisaishi",
        "bpm": 90,
        "offset": 0.0,
        "duration": 75,
        "level": 2,
        "age": "7-9 años",
        "description": "Fase Asociativa - Hilera superior y coordinación bimanual"
    },
    {
        "id": "viva_la_vida",
        "title": "Viva La Vida",
        "artist": "Coldplay (Strings)",
        "query": "ytsearch1:Viva La Vida string quartet instrumental",
        "bpm": 98,
        "offset": 0.0,
        "duration": 75,
        "level": 2,
        "age": "7-9 años",
        "description": "Fase Asociativa - Bigramas continuos e hilera inferior"
    },
    {
        "id": "undertale_once",
        "title": "Once Upon a Time",
        "artist": "Toby Fox",
        "query": "ytsearch1:Undertale OST 001 Once Upon a Time",
        "bpm": 110,
        "offset": 0.0,
        "duration": 75,
        "level": 3,
        "age": "9-10 años",
        "description": "Fase Autónoma - Mecanografía a ciegas y números"
    },
    {
        "id": "harder_better",
        "title": "Harder, Better, Faster, Stronger",
        "artist": "Daft Punk",
        "query": "ytsearch1:Harder Better Faster Stronger official instrumental",
        "bpm": 123,
        "offset": 0.0,
        "duration": 75,
        "level": 3,
        "age": "9-10 años",
        "description": "Fase Autónoma - Ráfagas de n-gramas rítmicos (>25 WPM)"
    }
]

OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "public", "audio"))

def download_track(track):
    track_id = track["id"]
    final_output = os.path.join(OUTPUT_DIR, f"{track_id}.mp3")
    
    if os.path.exists(final_output) and os.path.getsize(final_output) > 20000:
        print(f"[OK] {track_id} ya existe ({os.path.getsize(final_output)} bytes)")
        return True

    print(f"\n[DOWNLOAD] Descargando {track['title']} con yt-dlp...")
    temp_target = os.path.join(OUTPUT_DIR, f"raw_{track_id}.%(ext)s")
    
    cmd_dl = [
        "yt-dlp",
        "--extractor-args", "youtube:player_client=android",
        "-f", "bestaudio/best",
        "--extract-audio",
        "--audio-format", "mp3",
        "--audio-quality", "128K",
        "-o", temp_target,
        "--no-playlist",
        "--quiet",
        track["query"]
    ]
    
    try:
        subprocess.run(cmd_dl, check=True)
    except Exception as e:
        print(f"[ERROR] Error al descargar {track_id}: {e}")
        return False

    raw_file = os.path.join(OUTPUT_DIR, f"raw_{track_id}.mp3")
    if not os.path.exists(raw_file):
        for f in os.listdir(OUTPUT_DIR):
            if f.startswith(f"raw_{track_id}"):
                raw_file = os.path.join(OUTPUT_DIR, f)
                break
                
    if not os.path.exists(raw_file):
        print(f"[ERROR] No se encontró el archivo descargado para {track_id}")
        return False

    print(f"[TRIM & NORMALIZE] Procesando {track_id} con ffmpeg ({track['duration']}s @ -16 LUFS)...")
    cmd_ffmpeg = [
        "ffmpeg",
        "-y",
        "-ss", "00:00:00",
        "-t", str(track["duration"]),
        "-i", raw_file,
        "-af", "loudnorm=I=-16:TP=-1.5:LRA=11",
        "-b:a", "128k",
        final_output
    ]
    
    try:
        subprocess.run(cmd_ffmpeg, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        if os.path.exists(raw_file):
            os.remove(raw_file)
        print(f"[LISTO] {track_id}.mp3 completado ({os.path.getsize(final_output)} bytes)")
        return True
    except Exception as e:
        print(f"[ERROR] Error en ffmpeg para {track_id}: {e}")
        return False

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    manifest = []
    
    for track in TRACKS:
        success = download_track(track)
        manifest.append({
            "id": track["id"],
            "title": track["title"],
            "artist": track["artist"],
            "bpm": track["bpm"],
            "duration": track["duration"],
            "level": track["level"],
            "age": track["age"],
            "description": track["description"],
            "audioUrl": f"./audio/{track['id']}.mp3" if success else None,
            "hasAudio": success
        })
        
    manifest_path = os.path.join(OUTPUT_DIR, "manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    print(f"\n[MANIFEST] Manifest actualizado: {manifest_path}")

if __name__ == "__main__":
    main()
