import { Textarea } from "@heroui/react";

export default function NoteCell({ value }: { value: string }) {
    return (
        <Textarea
            isReadOnly
            minRows={1}
            variant="faded"
            placeholder="Add note"
            value={value}
            classNames={{
                base: "min-w-[120px]",
                inputWrapper: "px-2 transition-colors-opacity !duration-250",
                innerWrapper: "h-full",
                input: "resize-none overflow-y-auto h-5 text-balance text-foreground !ease-[ease] !duration-250 !transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity] placeholder:transition-colors-opacity placeholder:italic",
            }}
        />
    );
}
