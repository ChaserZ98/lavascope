import { Input } from "@heroui/react";

export default function PortCell({ value }: { value: string }) {
    return (
        <Input
            isReadOnly
            placeholder="Port"
            aria-label="Port"
            variant="faded"
            value={value}
            classNames={{
                base: "min-w-[80px]",
                inputWrapper: "transition-colors-opacity !duration-250",
                input: "text-foreground transition-colors-opacity",
            }}
        />
    );
}
