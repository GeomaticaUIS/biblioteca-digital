#!/usr/bin/env python3
"""Build compressed catalog shards for the static-site search."""

import argparse
import gzip
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parent


def load_source_parts(source_manifest: Path) -> list[str]:
    with source_manifest.open(encoding="utf-8") as source:
        source_parts = json.load(source)
    if not isinstance(source_parts, list):
        raise ValueError(f"{source_manifest} must contain a JSON array")
    return source_parts


def write_shard(path: Path, documents: list[dict]) -> None:
    with path.open("wb") as output:
        with gzip.GzipFile(fileobj=output, mode="wb", compresslevel=9, mtime=0) as compressed:
            compressed.write(
                json.dumps(documents, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
            )


def build_index(source_manifest: Path, output_dir: Path, shard_size: int) -> None:
    if shard_size < 1:
        raise ValueError("shard size must be greater than zero")

    source_parts = load_source_parts(source_manifest)
    output_dir.mkdir(parents=True, exist_ok=True)

    shard_names = []
    file_types = set()
    buffered_documents = []
    total_documents = 0

    for part in source_parts:
        part_path = ROOT / part
        with part_path.open(encoding="utf-8") as source:
            part_documents = json.load(source)
        if not isinstance(part_documents, list):
            raise ValueError(f"{part_path} must contain a JSON array")

        for document in part_documents:
            file_type = document.get("fileTypeDisplay") or document.get("fileType", "").upper()
            if file_type:
                file_types.add(str(file_type))
            buffered_documents.append(document)
            total_documents += 1

            if len(buffered_documents) == shard_size:
                shard_name = f"part-{len(shard_names) + 1:04d}.json.gz"
                write_shard(output_dir / shard_name, buffered_documents)
                shard_names.append(shard_name)
                buffered_documents = []

    if buffered_documents:
        shard_name = f"part-{len(shard_names) + 1:04d}.json.gz"
        write_shard(output_dir / shard_name, buffered_documents)
        shard_names.append(shard_name)

    for old_shard in output_dir.glob("part-*.json.gz"):
        if old_shard.name not in shard_names:
            old_shard.unlink()

    manifest = {
        "version": 1,
        "totalDocuments": total_documents,
        "shardSize": shard_size,
        "fileTypes": sorted(file_types, key=str.casefold),
        "shards": shard_names,
    }
    with (output_dir / "manifest.json").open("w", encoding="utf-8") as output:
        json.dump(manifest, output, ensure_ascii=False, separators=(",", ":"))
        output.write("\n")

    print(
        f"Generated {len(shard_names)} compressed shards "
        f"for {total_documents} documents in {output_dir}"
    )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--source-manifest",
        type=Path,
        default=ROOT / "catalog" / "index.json",
        help="JSON file listing the source catalog parts",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=ROOT / "catalog" / "search",
        help="directory for generated compressed shards",
    )
    parser.add_argument(
        "--shard-size",
        type=int,
        default=10_000,
        help="number of documents per generated shard",
    )
    args = parser.parse_args()
    build_index(args.source_manifest, args.output_dir, args.shard_size)


if __name__ == "__main__":
    main()
