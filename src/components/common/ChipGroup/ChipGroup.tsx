import Icon, { IconProps } from "../Icon/Icon";
import classes from "./ChipGroup.module.css";

export interface Chip {
  [key: string]: unknown;
  id: number;
  name: string;
  icon: string;
  iconProps?: Partial<IconProps>;
}

interface ChipGroupProps {
  chips: Chip[];
  onChange: (chip: Chip) => void;
  value?: number;
}

const ChipGroup = ({ chips, onChange, value = 0 }: ChipGroupProps) => {
  const handleChange = (id: number) => {
    onChange(chips.find((chip) => chip.id === id) || chips[0]);
  };

  return (
    <fieldset className={classes.chipgroup}>
      <legend style={{ visibility: "hidden" }}>Workspace image</legend>
      {chips.map((chip) => (
        <label key={chip.name} className={classes.chip}>
          <input
            type="radio"
            name="stack"
            value={chip.id}
            className={classes.input}
            checked={chips[value].id === chip.id}
            onChange={() => handleChange(chip.id)}
          />
          <div className={classes.wrapper}>
            <Icon name={chip.icon} size={1} {...(chip.iconProps ?? {})} />
            <span>{chip.name}</span>
          </div>
        </label>
      ))}
    </fieldset>
  );
};

export default ChipGroup;
