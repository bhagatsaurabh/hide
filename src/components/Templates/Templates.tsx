import Image from "../common/Image/Image";
import classes from "./Templates.module.css";
import templates from "@/assets/templates.json";

const Templates = () => {
  const tmplts = [
    ...templates,
    {
      path: "../../../assets/icons/container.svg",
      alt: "Empty",
      style: { color: "#838383" },
      "data-href": "",
    },
  ];

  return (
    <>
      <h1 className={classes.heading}>Starter templates</h1>
      <div className={classes.list}>
        {tmplts.map((template, idx) => (
          <a key={idx} className={classes.template} href={(template as Record<string, string>)["data-href"]}>
            <Image {...template} className="w-3 h-3 sm:w-7p5 sm:h-6 md:w-10 md:h-8 of-contain" asset />
            <span>{template.alt}</span>
          </a>
        ))}
      </div>
    </>
  );
};

export default Templates;
