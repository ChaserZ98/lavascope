import click_extra
from lavascope_cli_lib.android_keystore.generate_keystore import (
    GenerateKeystoreKeytoolError,
    GenerateKeystoreProcessError,
    GenerateKeystoreUnknownError,
    generate_keystore,
)
from lavascope_cli_lib.android_keystore.generate_properties import generate_properties
from lavascope_cli_lib.build_info import BuildInfo


@click_extra.command(help="Generate build info")
def build_info():
    version_metadata = BuildInfo()
    res = version_metadata.save_to_file()
    click_extra.secho(
        f"Build info saved to {click_extra.style(res, fg='yellow')}", fg="green"
    )


@click_extra.command(help="Generate android keystore")
def android_keystore():
    try:
        res = generate_keystore()
        click_extra.echo(res.stdout)
        click_extra.secho(res.stderr, fg="yellow")

        res = generate_properties()
        click_extra.secho(
            f"Properties file generated at {click_extra.style(res, fg='yellow')}",
            fg="green",
        )
    except (
        GenerateKeystoreKeytoolError,
        GenerateKeystoreProcessError,
        GenerateKeystoreUnknownError,
    ) as e:
        click_extra.echo(e, err=True)
    except Exception as e:
        click_extra.echo(f"Unknown error: {e}", err=True)


@click_extra.extra_group(help="lavascope build commands", params=None)
def lavascope_cli():
    pass


lavascope_cli.add_command(cmd=android_keystore, name="android-keystore")
lavascope_cli.add_command(cmd=build_info, name="build-info")
