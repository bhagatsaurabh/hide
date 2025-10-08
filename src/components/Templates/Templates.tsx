import { CSSProperties } from "react";
import Image from "../common/Image/Image";
import classes from "./Templates.module.css";
import { useAppSelector } from "@/hooks/store";
import { selectTemplates } from "@/store/env";

const Templates = () => {
  const templates = useAppSelector(selectTemplates);
  const tmplts = [
    ...templates.map((template) => ({
      ...template,
      path: `/icons/${template.image.substring(template.image.lastIndexOf("-") + 1)}.svg`,
      alt: template.name,
    })),
  ] as unknown as {
    path: string;
    alt: string;
    style: CSSProperties;
    image: string;
    "data-href": string;
  }[];

  tmplts[0].style = { color: "#838383" };
  tmplts[0]["data-href"] = "";

  return (
    <>
      <h1 className={classes.heading}>Starter templates</h1>
      <div className={classes.list}>
        {tmplts.map((template, idx) => (
          <a key={idx} className={classes.template} href={template["data-href"]}>
            <Image {...template} className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 of-contain" />
            <span>{template.alt}</span>
          </a>
        ))}
      </div>
    </>
  );
};

export default Templates;
