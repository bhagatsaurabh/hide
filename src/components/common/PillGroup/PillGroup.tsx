import Button from "../Button/Button";
import Image from "../Image/Image";
import classes from "./PillGroup.module.css";

export interface Pill {
  [key: string]: unknown;
  id: number | string;
  text: string;
  image: string;
}

interface PillGroupProps {
  pills: Pill[];
  onRemove: (pill: Pill) => void;
  value?: number;
}

const PillGroup = ({ pills, onRemove }: PillGroupProps) => {
  return (
    <div className={classes.pillgroup}>
      {pills.map((pill) => (
        <div key={pill.id} className={classes.pill}>
          <Image
            className="p-0p35 w-2 h-2 sm:w-7p5 sm:h-6 md:w-10 md:h-8 of-contain br-5t"
            path={pill.image || "../../../assets/icons/guest.svg"}
            alt={pill.text}
            asset={!pill.image}
          />
          <span className={classes.text}>{pill.text}</span>
          <Button className="p-0p5" icon="close" size={1.2} onClick={() => onRemove(pill)} fit />
        </div>
      ))}
    </div>
  );
};

export default PillGroup;
