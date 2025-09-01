import { useRef, useState } from "react";
import classes from "./EmailProvider.module.css";
import { useAppDispatch } from "@/hooks/store";
import { AuthType, signIn } from "@/store/auth";
import Button from "@/components/common/Button/Button";
import { Input, InputRef } from "@/components/common/Input/Input";
import { emailPinRegex, emailRegex, errorMap } from "@/utils/constants";
import { registerEmail } from "@/services/auth";
import { notify } from "@/store/notifications";
import { InternalNotificationPayload } from "@/models/notification";
import PINInput, { PINInputRef } from "@/components/common/PINInput/PINInput";
import classNames from "classnames";
import { isAxiosError } from "axios";

const EmailProvider = () => {
  const dispatch = useAppDispatch();
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const emailInput = useRef<InputRef>(null);
  const [pinRequested, setpinRequested] = useState(false);
  const [pin, setPin] = useState("");
  const pinInput = useRef<PINInputRef>(null);

  const handleCancel = () => {
    setPin("");
    setpinRequested(false);
  };
  const handleContinue = async () => {
    setBusy(true);

    if (pinRequested) {
      const err = pinInput.current?.validate(pin);
      if (err) {
        pinInput.current?.clear(true);
        setBusy(false);
        return;
      }

      const error = await dispatch(signIn({ type: AuthType.EMAIL, req: { email, code: pin } })).unwrap();
      if (error) {
        pinInput.current?.clear(true);
        if (error.validationErr) {
          pinInput.current?.invalidate(error.validationErr);
        } else {
          dispatch(
            notify({ status: "error", title: error.title, message: error.message } as InternalNotificationPayload)
          );
        }
      }
    } else {
      const err = emailInput.current?.validate(email);
      if (err) {
        setBusy(false);
        return;
      }

      try {
        const res = await registerEmail(email);
        setpinRequested(true);
      } catch (error) {
        if (!isAxiosError(error) || !errorMap[error.response?.data.message]) {
          console.log(error);
          dispatch(
            notify({
              status: "error",
              title: "Email registration failed",
              message: "Could not request for email registration, please try again",
            } as InternalNotificationPayload)
          );
          pinInput.current?.clear(true);
          return;
        }
        const errMsg = errorMap[error.response?.data.message];
        dispatch(
          notify({ status: "error", title: errMsg.title, message: errMsg.message } as InternalNotificationPayload)
        );
        pinInput.current?.clear(true);
      }
    }

    setBusy(false);
  };
  const validateEmail = (val: string) => {
    if (!val) return "Provide an email";
    if (!emailRegex.test(val)) {
      return "Enter a valid email";
    }
    return "";
  };
  const validatePin = (val: string) => {
    if (!val || !emailPinRegex.test(val)) return "Invalid pin";
    return "";
  };

  return (
    <div className={classes["sign-guest"]}>
      <h2 className={classes.heading}>Sign in using an Email</h2>
      {!pinRequested ? (
        <Input
          className="w-16"
          attrs={{ spellCheck: false, autoComplete: "off" }}
          placeholder="Email"
          type="email"
          value={email}
          onChange={setEmail}
          validator={validateEmail}
          ref={emailInput}
        />
      ) : (
        <PINInput length={5} onChange={setPin} validator={validatePin} ref={pinInput} />
      )}
      <div className={classNames({ [classes.actions]: true, "mt-2": true })}>
        {pinRequested && (
          <Button size={1.25} onClick={handleCancel}>
            Cancel
          </Button>
        )}
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
    </div>
  );
};

export default EmailProvider;
