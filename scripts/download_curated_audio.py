#!/usr/bin/env python3
"""
Pipeline de descarga y normalización de canciones COMPLETAS para Typoniac.
Descarga las canciones íntegras con yt-dlp y normaliza con ffmpeg a -16 LUFS.
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
        "bpm": 70.0,
        "first_beat_offset": 1.2,
        "level": 1,
        "age": "5-7 años",
        "description": "Fase Cognitiva - Hilera Guía central (A-S-D-F / J-K-L-Ñ) a 70 BPM"
    },
    {
        "id": "mario_dire_docks",
        "title": "Dire, Dire Docks",
        "artist": "Koji Kondo",
        "query": "ytsearch1:Dire Dire Docks Super Mario 64 OST",
        "bpm": 80.0,
        "first_beat_offset": 0.05,
        "level": 1,
        "age": "5-7 años",
        "description": "Fase Cognitiva - Arpegios acuáticos a 80 BPM"
    },
    {
        "id": "totoro_theme",
        "title": "My Neighbor Totoro",
        "artist": "Joe Hisaishi",
        "query": "ytsearch1:My Neighbor Totoro instrumental Joe Hisaishi",
        "bpm": 116.0,
        "first_beat_offset": 0.1,
        "level": 2,
        "age": "7-9 años",
        "description": "Fase Asociativa - Hilera superior y coordinación bimanual a 116 BPM"
    },
    {
        "id": "viva_la_vida",
        "title": "Viva La Vida",
        "artist": "Coldplay (Strings)",
        "query": "ytsearch1:Viva La Vida string quartet instrumental",
        "bpm": 138.0,
        "first_beat_offset": 0.25,
        "level": 2,
        "age": "7-9 años",
        "description": "Fase Asociativa - Cuerdas rítmicas a 138 BPM"
    },
    {
        "id": "undertale_once",
        "title": "Once Upon a Time",
        "artist": "Toby Fox",
        "query": "ytsearch1:Undertale OST 001 Once Upon a Time",
        "bpm": 120.0,
        "first_beat_offset": 0.08,
        "level": 3,
        "age": "9-10 años",
        "description": "Fase Autónoma - Mecanografía a ciegas y precisión métrica a 120 BPM"
    },
    {
        "id": "harder_better",
        "title": "Harder, Better, Faster, Stronger",
        "artist": "Daft Punk",
        "query": "ytsearch1:Harder Better Faster Stronger official instrumental",
        "bpm": 123.0,
        "first_beat_offset": 0.15,
        "level": 3,
        "age": "9-10 años",
        "description": "Fase Autónoma - Ráfagas rítmicas de n-gramas a 123 BPM"
    }
]

OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "public", "audio"))

def get_duration(file_path):
    cmd = ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", file_path]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    try:
        return float(res.stdout.strip())
    except:
        return 120.0

def download_full_track(track):
    track_id = track["id"]
    final_output = os.path.join(OUTPUT_DIR, f"{track_id}.mp3")
    
    # Si ya existe pero dura menos de 90 segundos, es la versión recortada vieja -> volver a procesar
    if os.path.exists(final_output) and get_duration(final_output) > 95:
        dur = get_duration(final_output)
        print(f"[OK] {track_id} ya es canción completa ({dur:.1f}s)")
        return True, dur

    print(f"\n[DOWNLOAD] Descargando CANCIÓN COMPLETA: {track['title']} con yt-dlp...")
    temp_target = os.path.join(OUTPUT_DIR, f"full_raw_{track_id}.%(ext)s")
    
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
        return False, 0

    raw_file = os.path.join(OUTPUT_DIR, f"full_raw_{track_id}.mp3")
    if not os.path.exists(raw_file):
        for f in os.listdir(OUTPUT_DIR):
            if f.startswith(f"full_raw_{track_id}"):
                raw_file = os.path.join(OUTPUT_DIR, f)
                break
                
    if not os.path.exists(raw_file):
        print(f"[ERROR] No se encontró el archivo descargado para {track_id}")
        return False, 0

    print(f"[NORMALIZE] Normalizando canción completa {track_id} a -16 LUFS con ffmpeg...")
    cmd_ffmpeg = [
        "ffmpeg",
        "-y",
        "-i", raw_file,
        "-af", "loudnorm=I=-16:TP=-1.5:LRA=11",
        "-b:a", "128k",
        final_output
    ]
    
    try:
        subprocess.run(cmd_ffmpeg, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        if os.path.exists(raw_file):
            os.remove(raw_file)
        duration = get_duration(final_output)
        print(f"[COMPLETA] {track_id}.mp3 lista ({duration:.1f}s, {os.path.getsize(final_output)} bytes)")
        return True, duration
    except Exception as e:
        print(f"[ERROR] Error en ffmpeg para {track_id}: {e}")
        return False, 0

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    manifest = []
    
    for track in TRACKS:
        success, duration = download_full_track(track)
        manifest.append({
            "id": track["id"],
            "title": track["title"],
            "artist": track["artist"],
            "bpm": track["bpm"],
            "first_beat_offset": track["first_beat_offset"],
            "duration": round(duration, 1),
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
