import { Textarea } from "@heroui/react";

export default function SourceAddressCell({ value }: { value: string }) {
    return (
        <Textarea
            isReadOnly
            minRows={1}
            maxRows={4}
            variant="faded"
            placeholder="Source Address"
            value={value}
            classNames={{
                base: "min-w-[150px]",
                inputWrapper: "px-2 transition-colors-opacity !duration-250",
                innerWrapper: "h-full",
                input: "resize-none h-5 text-foreground !ease-[ease] !duration-250 !transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity] placeholder:transition-colors-opacity placeholder:italic",
            }}
        />
    );
}
