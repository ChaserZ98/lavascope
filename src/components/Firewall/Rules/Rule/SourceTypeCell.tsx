import { Input } from "@heroui/react";
import { useLingui } from "@lingui/react/macro";

export default function SourceTypeCell({
    source,
    subnet,
}: {
    source: "" | "cloudflare";
    subnet: string;
}) {
    const { t } = useLingui();

    const value =
        source === "cloudflare"
            ? t`Cloudflare`
            : subnet === "::" || subnet === "0.0.0.0"
              ? t`Anywhere`
              : t`Custom`;

    return (
        <Input
            isReadOnly
            placeholder="Source Type"
            aria-label="Source Type"
            variant="faded"
            value={value}
            classNames={{
                base: "min-w-[130px]",
                inputWrapper: "transition-colors-opacity !duration-250",
                input: "text-foreground transition-colors-opacity capitalize",
            }}
        />
    );
}
