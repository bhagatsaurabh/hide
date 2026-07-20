import { useServiceHealth } from "@/hooks/service-health";
import SimpleModal from "../common/SimpleModal/SimpleModal";
import Spinner from "../common/Spinner/Spinner";
import { useMemo } from "react";
import { health, start, status } from "@/services/health";

const ServiceCheck = () => {
  const apis = useMemo(() => ({ status, start, health }), []);
  const startup = useServiceHealth(apis);

  return (
    <>
      {startup.popupVisible && (
        <>
          <SimpleModal title="service-check" className="p-1p5" layer={100} plain>
            <div>
              <Spinner size={1.5} />
              <h3>{startup.title}</h3>
              <p>{startup.message}</p>
            </div>
          </SimpleModal>
        </>
      )}
    </>
  );
};

export default ServiceCheck;
