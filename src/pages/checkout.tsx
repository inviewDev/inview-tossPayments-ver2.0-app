import { useEffect, useRef, useState } from "react";
import { PaymentWidgetInstance,loadPaymentWidget,ANONYMOUS,} from "@tosspayments/payment-widget-sdk";
import { nanoid } from "nanoid";
import { useQuery } from "@tanstack/react-query";
import { buttons } from '../../data/price';
const clientKey = "live_gck_yL0qZ4G1VOLo1ke0zzKYroWb2MQY";
const customerKey = nanoid();

export default function Home() {
  const { data: paymentWidget } = usePaymentWidget(clientKey, ANONYMOUS);
  const paymentMethodsWidgetRef = useRef<ReturnType<
    PaymentWidgetInstance["renderPaymentMethods"]
  > | null>(null);
  const agreementsWidgetRef = useRef<ReturnType<
    PaymentWidgetInstance["renderAgreement"]
  > | null>(null);

  const [price, setPrice] = useState(0)
  const [activeSelect, setActiveSelect] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerOrder, setCustomerOrder] = useState('');
  const [emailPrefix, setEmailPrefix] = useState('');
  const [emailSuffix, setEmailSuffix] = useState('gmail.com');
  const [customerMobilePhone, setCustomerMobilePhone] = useState('');
  const [emailDomain, setEmailDomain] = useState('');
  const [isCustomDomain, setIsCustomDomain] = useState(false);
  const [selectedButton, setSelectedButton] = useState("");
  const [selectedOption, setSelectedOption] = useState("");

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

  useEffect(() => {
    if (paymentWidget == null) {
      return;
    }
    const paymentMethodsWidget = paymentWidget.renderPaymentMethods(
      "#payment-widget",
      { value: price },
      { variantKey: "DEFAULT" }
    );

    paymentMethodsWidgetRef.current = paymentMethodsWidget;
    paymentWidget.renderAgreement("#agreement", {
      variantKey: "AGREEMENT",
    });
  }, [paymentWidget]);

  useEffect(() => {
    const paymentMethodsWidget = paymentMethodsWidgetRef.current;

    if (paymentMethodsWidget == null) {
      return;
    }
    paymentMethodsWidget.updateAmount(price);
  }, [price]);

  const handleButtonClick = (id: string, buttonName: string) => {
    setActiveSelect(id);
    setSelectedButton(buttonName);
    setPrice(0);
    setSelectedOption("");
  };
  
  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setPrice(Number(event.target.value));
    setActiveSelect(null);
    setSelectedOption(event.target.options[event.target.selectedIndex].text);
  };

  

  return (
    <section className="payment_wrap">
        <div className="user_info">
          <h1>주문자 정보</h1>
          <p>주문옵션</p>
          <div className="product_Wrap">
            {buttons.map((button, i) => (
              <div className="btnWrap" key={i}>
                <button 
                  className={`btnCont ${activeSelect === `select${i}` ? 'active' : ''}`}
                  onClick={() => handleButtonClick(`select${i}`, button.name)}
                >
                  {button.name}
                </button>
                {activeSelect === `select${i}` && (
                  <select onChange={handleSelectChange}>
                    {button.options.map((option, j) => (
                      <option key={j} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>
          <p>구매자명</p>
          <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="구매자명을 입력해주세요." required />
          <p>업체명</p>
          <input type="text" value={customerOrder} onChange={(e) => setCustomerOrder(e.target.value)} placeholder="업체명을 입력해주세요." required />
          <p>이메일주소</p>
          <div className="emailBox">
            <input value={emailPrefix} onChange={(e) => setEmailPrefix(e.target.value)} placeholder="이메일" />
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
              type="tel" 
              value={customerMobilePhone} 
              onChange={(e) => setCustomerMobilePhone(formatPhoneNumber(e.target.value))} 
              placeholder="전화번호를 입력해주세요." 
              required 
          />
          <div className="total">
            {selectedOption && <p>주문옵션 : <b>{selectedButton}</b> + <b>{selectedOption}</b></p>}
            <span>최종금액 : <b>{`${price.toLocaleString()}원`}</b></span>
          </div>
        </div>
        <div className="method_info">
          <div className="box_section">
            <div id="payment-widget" style={{ width: "100%" }} />
            <div id="agreement" style={{ width: "100%" }} />
          </div>
        </div>
        <div className="result wrapper">
            <button
              className={ price !==0 && customerOrder && customerName && emailPrefix && (isCustomDomain ? emailDomain : emailSuffix) && customerMobilePhone.length === 13 ? "button" : "button disable"}
              onClick={async () => {
                try {
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
      return loadPaymentWidget(clientKey, customerKey);
    },
  });
}
