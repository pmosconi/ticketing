import { useEffect, useState } from "react";
import Router from "next/router";
import StripeCheckout from "react-stripe-checkout";
import useRequest from "../../hooks/useRequest";

const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const { doRequest, errors } = useRequest({
    url: "/api/payments",
    method: "post",
    body: { orderId: order.id },
    onSuccess: () => Router.push('/orders'),
  });

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      const timeLeft = Math.round(msLeft / 1000);
      setTimeLeft(timeLeft);
    };

    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);

    return () => {
      clearInterval(timerId);
    };  
  }, []);

  if (timeLeft <= 0) {
    return <div>Order expired!</div>;
  }

  return (
    <div>
      Time left to pay: {timeLeft} seconds
      <StripeCheckout
        token={({ id }) => doRequest({ token: id })}
        stripeKey="pk_test_51JdyRVB4WVg2VDwkJ2qqsbnwARcgLSdw2Gz6Fkw6zT1qf4i4EV3yOKJW5EOCWSag901Ty8WWzJXeY5Q2bTxCtTGj001O2sAPiv"
        amount={order.ticket.price * 100}
        email={currentUser.email}
      />
      {errors}
    </div>
  );
};

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);
  return { order: data };
};

export default OrderShow;
