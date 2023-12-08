import { useEffect, useRef, useState } from "react";
import {
  PaymentWidgetInstance,
  loadPaymentWidget,
  ANONYMOUS,
} from "@tosspayments/payment-widget-sdk";
import { nanoid } from "nanoid";
import { useQuery } from "@tanstack/react-query";

// TODO: clientKey는 개발자센터의 결제위젯 연동 키 > 클라이언트 키로 바꾸세요.
// TODO: customerKey는 구매자와 1:1 관계로 무작위한 고유값을 생성하세요.
// @docs https://docs.tosspayments.com/reference/using-api/api-keys
const clientKey = "test_gck_ma60RZblrqBdewZpABvE8wzYWBn1";
const customerKey = nanoid();

export default function Home() {
  // const { data: paymentWidget } = usePaymentWidget(clientKey, customerKey);
  const { data: paymentWidget } = usePaymentWidget(clientKey, ANONYMOUS); // 비회원 결제
  const paymentMethodsWidgetRef = useRef<ReturnType<
    PaymentWidgetInstance["renderPaymentMethods"]
  > | null>(null);
  const agreementsWidgetRef = useRef<ReturnType<
    PaymentWidgetInstance["renderAgreement"]
  > | null>(null);

  const [price, setPrice] = useState(0)
  const [customerName, setCustomerName] = useState('');
  const [customerOrder, setCustomerOrder] = useState('');
  const [emailPrefix, setEmailPrefix] = useState('');
  const [emailSuffix, setEmailSuffix] = useState('gmail.com');
  const [customerMobilePhone, setCustomerMobilePhone] = useState('');
  const [emailDomain, setEmailDomain] = useState('');
  const [isCustomDomain, setIsCustomDomain] = useState(false);

  const formatPhoneNumber = (value: string) => {
    const number = value.replace(/[^\d]/g, "");
    let phone = "";
    if (number.length < 4) {
        return number;
    } else if (number.length < 7) {
        phone += number.substr(0, 3);
        phone += "-";
        phone += number.substr(3);
    } else {
        phone += number.substr(0, 3);
        phone += "-";
        phone += number.substr(3, 4);
        phone += "-";
        phone += number.substr(7);
    }
    return phone;
  };

  const nameRef = useRef(null);
  const emailPrefixRef = useRef(null);
  const phoneRef = useRef(null);

  useEffect(() => {
    if (paymentWidget == null) {
      return;
    }

    // ------  결제위젯 렌더링 ------
    // @docs https://docs.tosspayments.com/reference/widget-sdk#renderpaymentmethods선택자-결제-금액-옵션
    const paymentMethodsWidget = paymentWidget.renderPaymentMethods(
      "#payment-widget",
      { value: price },
      { variantKey: "DEFAULT" }
    );

    paymentMethodsWidgetRef.current = paymentMethodsWidget;

    // ------  이용약관 렌더링 ------
    // @docs https://docs.tosspayments.com/reference/widget-sdk#renderagreement선택자-옵션
    paymentWidget.renderAgreement("#agreement", {
      variantKey: "AGREEMENT",
    });
  }, [paymentWidget]);

  useEffect(() => {
    const paymentMethodsWidget = paymentMethodsWidgetRef.current;

    if (paymentMethodsWidget == null) {
      return;
    }

    // ------ 금액 업데이트 ------
    // @docs https://docs.tosspayments.com/reference/widget-sdk#updateamount결제-금액
    paymentMethodsWidget.updateAmount(price);
  }, [price]);

  return (
    <section className="payment_wrap">
        <div className="user_info">
          <h1>주문자 정보</h1>
          <p>주문금액</p>
          <input type="text" inputMode="numeric" placeholder="주문금액을 입력해주세요." pattern="\d*" value={price === 0 ? '' : price} onChange={(e) => {
            // 입력값이 없거나 숫자일 경우에만 상태 업데이트
              if (e.target.value === '' || /^\d+$/.test(e.target.value)) {
                setPrice(Number(e.target.value));
              }
            }}
            required
            style={{
              // 숫자 입력 필드의 업, 다운 버튼 숨기기
              appearance: 'textfield'
            }} />
          <p>구매자명</p>
          <input ref={nameRef} type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="구매자명을 입력해주세요." required />
          <p>업체명</p>
          <input ref={nameRef} type="text" value={customerOrder} onChange={(e) => setCustomerOrder(e.target.value)} placeholder="업체명을 입력해주세요." required />
          <p>이메일주소</p>
          <div className="emailBox">
            <input ref={emailPrefixRef} value={emailPrefix} onChange={(e) => setEmailPrefix(e.target.value)} placeholder="이메일" />
            <select value={emailSuffix} onChange={(e) => { setEmailSuffix(e.target.value); setIsCustomDomain(e.target.value === ''); }}>
              <option value="gmail.com">gmail.com</option>
              <option value="hanmail.net">hanmail.net</option>
              <option value="hotmail.com">hotmail.com</option>
              <option value="nate.com">nate.com</option>
              <option value="naver.com">naver.com</option>
              <option value="yahoo.com">yahoo.com</option>
              <option value="">직접입력</option>
            </select>
            {isCustomDomain && (<input type="text" className="selfInput" value={emailDomain} onChange={(e) => setEmailDomain(e.target.value)} placeholder="입력해주세요." />)}
          </div>
          <p>전화번호</p>
          <input 
              ref={phoneRef} 
              type="tel" 
              value={customerMobilePhone} 
              onChange={(e) => setCustomerMobilePhone(formatPhoneNumber(e.target.value))} 
              placeholder="전화번호를 입력해주세요." 
              required 
          />
          <div className="total"><span>최종금액: <b>{`${price.toLocaleString()}원`}</b></span></div>
        </div>
        <div className="method_info">
          <div className="box_section">
            <div id="payment-widget" style={{ width: "100%" }} />
            <div id="agreement" style={{ width: "100%" }} />
          </div>
        </div>
        <div className="result wrapper">
            <button
              className={customerOrder && customerName && emailPrefix && (isCustomDomain ? emailDomain : emailSuffix) && customerMobilePhone.length === 13 ? "button" : "button disable"}
              onClick={async () => {
                try {
                  // ------ '결제하기' 버튼 누르면 결제창 띄우기 ------
                  // @docs https://docs.tosspayments.com/reference/widget-sdk#requestpayment결제-정보
                  await paymentWidget?.requestPayment({
                    orderId: nanoid(),
                    orderName: customerOrder,
                    customerName: customerName,
                    customerEmail: emailPrefix + '@' + (isCustomDomain ? emailDomain : emailSuffix),
                    customerMobilePhone: customerMobilePhone.replace(/-/g, ''),
                    successUrl: `${window.location.origin}/success`,
                    failUrl: `${window.location.origin}/fail`,
                  });
                } catch (error) {
                  // 에러 처리하기
                  console.error(error);
                }
              }}
            >
              결제하기
            </button>
        </div>
    </section>
  );
}

function usePaymentWidget(clientKey: string, customerKey: string) {
  return useQuery({
    queryKey: ["payment-widget", clientKey, customerKey],
    queryFn: () => {
      // ------  결제위젯 초기화 ------
      // @docs https://docs.tosspayments.com/reference/widget-sdk#sdk-설치-및-초기화
      return loadPaymentWidget(clientKey, customerKey);
    },
  });
}
