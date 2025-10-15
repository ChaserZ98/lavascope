from lavascope_cli_lib.path_const import ROOT_DIR


def test_path_const():
    assert ROOT_DIR.exists(), "ROOT_DIR does not exist"
    assert ROOT_DIR.is_dir(), "ROOT_DIR is not a directory"
    assert ROOT_DIR.name == "lavascope", "ROOT_DIR name is not lavascope"
