import { useRouter } from "next/router";
import Link from 'next/link';

export default function FailPage() {
  const { query } = useRouter();
  return (
    <section className="payment_wrap">
      <div className="result wrapper">
        <div className="box_section">  
          <h2 style={{padding: "20px 0px 10px 0px"}}>
              결제 실패
          </h2>
          <p>{query.code ?? "UNKNOWN_ERROR"}</p>
          <p>{query.message ?? "알 수 없음"}</p>
      </div>
    </div>
    </section>
  );
}
