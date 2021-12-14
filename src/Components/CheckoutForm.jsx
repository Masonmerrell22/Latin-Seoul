import React ,{useState, useEffect} from 'react';
import { CardElement, useStripe, useElements, PaymentElement, PaymentRequestButtonElement } from "@stripe/react-stripe-js";
import axios from "axios";
import '../assets/css/Checkout.css'
import {useNavigate} from 'react-router-dom';
import { pick } from 'lodash';




const CheckoutForm = (props,{ price, onSuccessfulCheckout }) => {
    const navigate = useNavigate();
    const [paymentRequest, setPaymentRequest] = useState(null);
    const [success, setSuccess ] = useState(false)
    const [enableDis, setEnableDis ] = useState(false)
    const stripe = useStripe()
    const elements = useElements()

    const sendEmailPickup = async () => {

        const response = await axios.post("https://mama-lisas-api.herokuapp.com/send-email-pickup",{
          name: props.emailName,
          email: props.emailAddress,
          address:props.emailAddressAddress,
          confirmation: props.emailConfirmation,
          order: props.emailOrderData,
          pickuporDeliveryTime:props.emailPickuporDeliveryTime,
          total: props.emailTotal,
      
      
        });
        console.log(response.data)
        
       
        };


        const sendEmailDelivery = async () => {

            const response = await axios.post("https://mama-lisas-api.herokuapp.com/send-email-delivery",{
              name: props.emailName,
              email: props.emailAddress,
              address:props.emailAddressAddress,
              confirmation: props.emailConfirmation,
              order: props.emailOrderData,
              pickuporDeliveryTime:props.emailPickuporDeliveryTime,
              total: props.emailTotal,
          
          
            });
            console.log(response.data)
            
           
            };

       

        const orderData = {
            name: props.emailName,
          email: props.emailAddress,
          confirmation: props.emailConfirmation,
          order: props.emailOrderData,
          pickupOrDelivery: props.pickupOrDelivery,
          pickuporDeliveryTime:props.emailPickuporDeliveryTime,
          total: props.emailTotal,
          deliveryAddress:props.deliveryAddress
        }
   
    const handleSubmit = async (e) => {
        if(props.city != "pampa"){
            e.preventDefault()
            alert('We do not Deliver Outside of City Limits of PAMPA.')
        } else{
            setEnableDis(true )
            e.preventDefault()
        
        const {error, paymentMethod} = await stripe.createPaymentMethod({
            type: "card",
            card: elements.getElement(CardElement)
        })
        if(!error) {
            try {
                const {id} = paymentMethod
                const response = await axios.post("https://mama-lisas-api.herokuapp.com/payment", {
                    amount: props.price,
                    id,
                    confNumber: orderData.confirmation
                })
    
                if(response.data.success) {
                    console.log(orderData.pickupOrDelivery)
                    if(orderData.pickupOrDelivery === "Pick-up"){
                                            
                    console.log("Successful payment")
                    sendEmailPickup()
                    localStorage.setItem('cart-person', JSON.stringify(orderData))
                    navigate('/success')
                                        } else{
                                            console.log("Successful payment")
                                            sendEmailDelivery()
                                            localStorage.setItem('cart-person', JSON.stringify(orderData))
                                            navigate('/deliverysuccess')
                                        }
                    
                 
                   
                }
    
            } catch (error) {
                console.log("Error", error)
                setEnableDis(false )
            }
        } else {
            setEnableDis(false )
            console.log(error.message)
        }
    }
}

  return (
    <>
    {!success ? 
    <form onSubmit={handleSubmit}>
        <fieldset >
            <div className="FormRow">
                <CardElement  options={props.options}/>
          
            </div>
        </fieldset>
        <p style={{fontSize:'small'}}>Powered by <b>STRIPE</b></p>
        <div className="btns">
        <button disabled={enableDis} >Pay</button>
        </div>
    </form>
    :
   <div>
      
   </div> 
    }
        
    </>
  );
};
export default CheckoutForm;