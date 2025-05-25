import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { AuthStatus, selectStatus } from "@/store/auth";
import { fetchNotifications, selectNotifications } from "@/store/notifications";
import { readNotification } from "@/services/notifications";

export const NotificationBar = () => {
  const authStatus = useAppSelector(selectStatus);
  const dispatch = useAppDispatch();
  const ntfns = useAppSelector(selectNotifications);

  useEffect(() => {
    if (authStatus === AuthStatus.SIGNED_IN) {
      dispatch(fetchNotifications());
    }
  }, [authStatus, dispatch]);

  const handleNotificationRead = async (id: string) => {
    await readNotification({ id });
  };

  return (
    <>
      <span>Notifications: {ntfns.length}</span>
      <div>
        <ul>
          {ntfns.map((ntfn) => (
            <li>
              {ntfn.type}
              <button onClick={() => handleNotificationRead(ntfn.id)}></button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};
