import { IconTextButton } from "./icon_text_button";
import { Plus, PlusCircle } from 'lucide-react';

interface AddTaskButtonProps {
  onClick: () => void;
  onCreate?: () => void; // Called after successful task creation to refresh data
}

export function AddTaskButton({ onClick, onCreate }: AddTaskButtonProps) {
    return(
        <IconTextButton
        onClick={onClick}
        icon={
            <div className="relative h-5 w-5">
            <Plus className="h-5 w-5 text-orange-500 group-hover:opacity-0 opacity-100 transition-opacity duration-200 absolute inset-0" />
            <PlusCircle className="h-5 w-5 text-orange-500 group-hover:opacity-100 opacity-0 transition-opacity duration-200 absolute inset-0" />
            </div>
        }
        label="Add Task"
        variant="ghost"
        className="group text-black hover:text-orange-500 transition-colors duration-200"
        iconClassName="transition-all duration-200"
    />
    )
}