import os


def get_commit_sha_short():
    commit_sha_short = os.popen("git rev-parse --short HEAD").read().strip()
    print(f"commit_sha_short: {commit_sha_short}")
    with open(os.getenv("GITHUB_ENV"), "a") as env_file:
        env_file.write(f"COMMIT_SHA_SHORT={commit_sha_short}")


if __name__ == "__main__":
    get_commit_sha_short()
