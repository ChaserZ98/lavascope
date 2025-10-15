import json
import os
import shutil
from pathlib import Path


def artifact_list_move_rename():
    artifactArray = json.loads(os.getenv("RELEASE_ACTIFACTS", "[]"))
    for artifact_path in artifactArray:
        print(artifact_path)

        file_name = Path(artifact_path).name
        file_name_parts = file_name.split("_")
        if len(file_name_parts) > 1:
            file_name_parts[1] = os.getenv("COMMIT_SHA_SHORT", "")
        new_file_name: str = "_".join(file_name_parts)
        temp_dir = Path(os.getenv("RUNNER_TEMP", ""))

        target_path = temp_dir.joinpath(new_file_name)
        print(f"Moving and renaming {artifact_path} to {target_path}")
        shutil.move(artifact_path, temp_dir.joinpath(new_file_name))


if __name__ == "__main__":
    artifact_list_move_rename()
