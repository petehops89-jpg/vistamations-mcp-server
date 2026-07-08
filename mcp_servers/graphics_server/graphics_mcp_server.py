"""
VISTAMATIONS Graphics MCP Server
"""
import os
import json
import pathlib
import shutil
import subprocess
import logging
import sys
from mcp.server.fastmcp import FastMCP
from PIL import Image

logging.basicConfig(stream=sys.stderr, level=logging.DEBUG,
   format='%(asctime)s %(levelname)s %(message)s')

logging.debug(f"PATH: {os.environ.get('PATH', 'NOT SET')}")

mcp = FastMCP("vistamations-graphics")

ASSETS_BASE_PATH = pathlib.Path(r"C:\gemini-working\vista-oma-nextjs-starter\assets")

@mcp.tool()
def list_assets(subfolder: str = "") -> list[dict]:
    """
    Lists files in vista-oma-nextjs-starter/assets (and optional subfolder within it),
    returning name, path, size in bytes, and file extension for each.
    """
    search_path = ASSETS_BASE_PATH / subfolder
    if not search_path.is_dir():
        return [{"error": f"Subfolder '{subfolder}' not found."}]

    assets = []
    for f in search_path.iterdir():
        if f.is_file():
            assets.append({
                "name": f.name,
                "path": str(f),
                "size": f.stat().st_size,
                "extension": f.suffix
            })
    return assets

@mcp.tool()
def get_video_info(filename: str) -> dict:
    """
    Given a filename inside the assets folder, runs ffprobe (assume it's on PATH) and
    returns duration, fps, width, height, codec as a dict.
    """
    try:
        file_path = ASSETS_BASE_PATH / filename
        if not file_path.is_file():
            return {"error": f"File not found: {filename}"}

        command = [
            "ffprobe",
            "-v", "quiet",
            "-print_format", "json",
            "-show_streams",
            str(file_path)
        ]
        result = subprocess.run(command, capture_output=True, text=True, check=True)
        video_stream = json.loads(result.stdout)["streams"][0]

        # fps can be a fraction e.g. "30/1"
        avg_frame_rate = video_stream.get("avg_frame_rate", "0/1").split('/')
        fps = float(avg_frame_rate[0]) / float(avg_frame_rate[1]) if len(avg_frame_rate) == 2 and float(avg_frame_rate[1]) != 0 else 0

        return {
            "duration": float(video_stream.get("duration", 0)),
            "fps": fps,
            "width": video_stream.get("width", 0),
            "height": video_stream.get("height", 0),
            "codec": video_stream.get("codec_name", "unknown")
        }
    except Exception:
        logging.exception(f"Error in get_video_info for {filename}")
        return {"error": f"Error processing video file {filename}. See server logs for details."}

@mcp.tool()
def extract_frames(filename: str, count: int = 8) -> list[dict]:
    """
    Given a video filename in assets, uses ffmpeg to extract `count` evenly-spaced
    frames as PNGs into a new subfolder assets/extracted_frames/{filename_without_ext}/,
    and returns a list of the saved frame paths.
    """
    try:
        video_path = ASSETS_BASE_PATH / filename
        if not video_path.is_file():
            return [{"error": f"File not found: {filename}"}]

        output_dir_name = video_path.stem
        output_path = ASSETS_BASE_PATH / "extracted_frames" / output_dir_name

        if output_path.exists():
            shutil.rmtree(output_path)
        output_path.mkdir(parents=True)

        # Get video duration to calculate frame intervals
        video_info = get_video_info(filename)
        if "error" in video_info:
             return [video_info]
        duration = video_info.get("duration", 0)
        if duration == 0:
            return [{"error": "Could not determine video duration."}]

        output_pattern = output_path / "frame_%02d.png"
        command = [
            "ffmpeg",
            "-y",
            "-i", str(video_path),
            "-vf", f"fps={count}/{duration}",
            str(output_pattern)
        ]

        try:
            subprocess.run(
                command,
                capture_output=True,
                text=True,
                check=True,
                timeout=30,
                stdin=subprocess.DEVNULL
            )
        except subprocess.TimeoutExpired:
            return [{"error": "ffmpeg command timed out after 30 seconds."}]
        except subprocess.CalledProcessError as e:
            logging.error(f"ffmpeg command failed: {e.stderr}")
            return [{"error": f"ffmpeg command failed. See server logs for details. Stderr: {e.stderr}"}]

        output_files = [{"path": str(p)} for p in sorted(output_path.glob("frame_*.png"))]
        return output_files
    except Exception:
        logging.exception(f"Error in extract_frames for {filename}")
        return [{"error": f"Error extracting frames for {filename}. See server logs for details."}]


@mcp.tool()
def get_image_info(filename: str) -> dict:
    """
    Given an image filename in assets, returns width, height, format, and file size.
    """
    try:
        file_path = ASSETS_BASE_PATH / filename
        if not file_path.is_file():
            return {"error": f"File not found: {filename}"}

        with Image.open(file_path) as img:
            return {
                "width": img.width,
                "height": img.height,
                "format": img.format,
                "file_size": file_path.stat().st_size
            }
    except Exception:
        logging.exception(f"Error in get_image_info for {filename}")
        return {"error": f"Could not read image info for {filename}. See server logs for details."}


if __name__ == "__main__":
    try:
        mcp.run(transport="stdio")
    except Exception:
        logging.exception("Server crashed")
        raise
