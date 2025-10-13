import click_extra
from lavascope_cli_lib.android_keystore import generate_keystore, generate_properties
from lavascope_cli_lib.build_info import BuildInfo


@click_extra.command(help="Generate build info")
def build_info():
    version_metadata = BuildInfo()
    version_metadata.save_to_file()


@click_extra.command(help="Generate android keystore")
def android_keystore():
    generate_keystore()
    generate_properties()


@click_extra.extra_group(help="lavascope build commands", params=None)
def lavascope_cli():
    pass


lavascope_cli.add_command(cmd=android_keystore, name="android-keystore")
lavascope_cli.add_command(cmd=build_info, name="build-info")
