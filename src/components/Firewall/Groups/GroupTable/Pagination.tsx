import { Pagination } from "@heroui/react";

export default function TablePagination({ total, page, setPage, isLoading }: {
    total: number;
    page: number;
    setPage: (page: number) => void;
    isLoading?: boolean;
}) {
    return (
        <div className="sticky left-1/2 -translate-x-1/2 w-fit">
            <Pagination
                isDisabled={isLoading}
                showControls
                color="primary"
                variant="flat"
                page={page}
                total={total}
                onChange={(page) => setPage(page)}
                classNames={{
                    item: "text-foreground !transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,transform,background] !ease-[ease] !duration-250 bg-content3 [&[data-hover=true]:not([data-active=true])]:bg-content4",
                    prev: "text-foreground transition-colors-opacity bg-content3 [&[data-hover=true]:not([data-active=true])]:bg-content4 data-[disabled=true]:text-default-400",
                    next: "text-foreground transition-colors-opacity bg-content3 [&[data-hover=true]:not([data-active=true])]:bg-content4 data-[disabled=true]:text-default-400",
                }}
            />
        </div>
    );
}
