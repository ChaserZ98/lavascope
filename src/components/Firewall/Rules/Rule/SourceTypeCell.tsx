import { Input } from "@heroui/react";

export default function SourceTypeCell({ value }: { value: string }) {
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
