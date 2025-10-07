import { ChangeEvent, FormEvent } from "react";
import Icon from "../Icon/Icon";
import classes from "./Search.module.css";

interface SearchProps {
  onSearch: (val: string) => void;
  placeholder?: string;
}

const Search = ({ onSearch, placeholder = "Search" }: SearchProps) => {
  const handleSearch = (ev: MouseEvent | FormEvent) => {
    ev?.preventDefault();
  };
  const handleInput = (ev: ChangeEvent<HTMLInputElement>) => {
    if (!ev.target.value || ev.target.value.length < 3) {
      return;
    }
    onSearch(ev.target.value);
  };

  return (
    <div className={classes.search}>
      <form onSubmit={handleSearch} noValidate={true}>
        <Icon name="search" size={1.2} asset />
        <input
          onInput={(e) => handleInput(e as ChangeEvent<HTMLInputElement>)}
          type="text"
          spellCheck={false}
          name="search"
          placeholder={placeholder}
          autoComplete="off"
        />
        <div className={classes.hr}></div>
      </form>
    </div>
  );
};

export default Search;
