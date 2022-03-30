import { notify } from "notiwind";

export default (title: string, text: string, type = "success", seconds = 10000) => {
    notify(
        {
            title,
            text,
            type,
            group: "default",
        },
        seconds
    );
};
