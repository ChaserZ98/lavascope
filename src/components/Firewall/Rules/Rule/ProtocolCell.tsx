import { Input } from "@heroui/react";

export default function ProtocolCell({ value }: { value: string }) {
    return (
        <Input
            isReadOnly
            placeholder="Protocol"
            aria-label="Protocol"
            variant="faded"
            value={value}
            classNames={{
                base: "min-w-[150px]",
                inputWrapper: "transition-colors-opacity !duration-250",
                input: "text-foreground transition-colors-opacity",
            }}
        />
    );
}
