import axios from "axios";
import { GetServerSideProps } from "next";

// ------ Payment 객체 ------
// @docs https://docs.tosspayments.com/reference#payment-객체
interface Payment {
  orderName: string;
  approvedAt: string;
  receipt: {
    url: string;
  };
  totalAmount: number;
  method: "카드" | "가상계좌" | "계좌이체";
  paymentKey: string;
  orderId: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const {
    query: { paymentKey, orderId, amount },
  } = context;

  try {
    // ------  결제 승인 ------
    // @docs https://docs.tosspayments.com/guides/payment-widget/integration#3-결제-승인하기
    const { data: payment } = await axios.post<Payment>(
      "https://api.tosspayments.com/v1/payments/confirm",
      {
        paymentKey,
        orderId,
        amount,
      },
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${process.env.TOSS_PAYMENTS_SECRET_KEY}:`
          ).toString("base64")}`,
        },
      }
    );
    console.log(payment)
    return {
      props: { payment },
    };
  } catch (err: any) {
    console.error("err", err.response.data);

    return {
      redirect: {
        destination: `/fail?code=${err.response.data.code}&message=${encodeURIComponent(err.response.data.message)}`,
        permanent: false,
      },
    };
  }
};

interface Props {
  payment: Payment;
}
export default function SuccessPage({ payment }: Props) {
  return (
    <section className="payment_wrap">
      <div className="result wrapper">
        <div className="box_section">  
          <h2>
              결제가 완료되었습니다.
          </h2>
        </div>
      </div>
    </section>
  );
}
