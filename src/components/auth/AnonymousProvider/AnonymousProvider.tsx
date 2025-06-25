import { useState } from "react";
import classes from "./AnonymousProvider.module.css";
import { useAppDispatch } from "@/hooks/store";
import { AuthType, signIn } from "@/store/auth";
import Button from "@/components/common/Button/Button";
import InfoBox from "@/components/common/InfoBox/InfoBox";

const AnonymousProvider = () => {
  const dispatch = useAppDispatch();
  const [busy, setBusy] = useState(false);

  const handleContinue = async () => {
    setBusy(true);
    await dispatch(signIn({ type: AuthType.GUEST }));
    setBusy(false);
  };

  return (
    <div className={classes["sign-guest"]}>
      <h2 className={classes.heading}>Guest</h2>
      <InfoBox type="info-warning" className="mb-2">
        Guest accounts gets auto-deleted in 2 days, including all the provisioned workspaces.
      </InfoBox>
      <Button
        busy={busy}
        disabled={busy}
        icon="chevron-right"
        iconProps={{ "data-position": "right" }}
        size={1.25}
        onClick={handleContinue}
      >
        Continue
      </Button>
    </div>
  );
};

export default AnonymousProvider;
