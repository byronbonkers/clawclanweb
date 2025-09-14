function makePaypalBtn(amount){
window.paypal
.Buttons({
    style: {
      shape: "rect",
      layout: "vertical",
      color: "gold",
      label: "paypal",
    },
    message: {
      amount: 8,
    },

    async createOrder() {
      try {
        const response = await fetch("https://byronbonkers.com/apipay/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          // use the "body" param to optionally pass additional order information
          // like product ids and quantities
          body: JSON.stringify({
            cart: [
              {
                id: "coins",
                quantity: "1",
                amount: amount
              },
            ],
          }),
        });

        const orderData = await response.json();

        if (orderData.id) {
          console.log(Clerk)
          fetch("https://byronbonkers.com/apipay/userId", {
              method: "POST",
              body: JSON.stringify({
                userId: Clerk.user.id,
                orderId: orderData.id
              }),
              headers: {
                "Content-type": "application/json; charset=UTF-8"
              }
            });
          return orderData.id;
        }
        const errorDetail = orderData?.details?.[0];
        const errorMessage = errorDetail
          ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
          : JSON.stringify(orderData);

        throw new Error(errorMessage);
      } catch (error) {
        console.error(error);
        resultMessage(`Could not initiate PayPal Checkout...<br><br>${error}`);
      }
      
    },
    
    async onApprove(data, actions) {
      try {
        
        const response = await fetch(`https://byronbonkers.com/apipay/orders/${data.orderID}/capture`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const orderData = await response.json();
        // Three cases to handle:
        //   (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
        //   (2) Other non-recoverable errors -> Show a failure message
        //   (3) Successful transaction -> Show confirmation or thank you message

        const errorDetail = orderData?.details?.[0];

        if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
          // (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
          // recoverable state, per
          // https://developer.paypal.com/docs/checkout/standard/customize/handle-funding-failures/
          return actions.restart();
        } else if (errorDetail) {
          // (2) Other non-recoverable errors -> Show a failure message
          throw new Error(`${errorDetail.description} (${orderData.debug_id})`);
        } else if (!orderData.purchase_units) {
          throw new Error(JSON.stringify(orderData));
        } else {
          // (3) Successful transaction -> Show confirmation or thank you message
          // Or go to another URL:  actions.redirect('thank_you.html');
          const transaction =
            orderData?.purchase_units?.[0]?.payments?.captures?.[0] ||
            orderData?.purchase_units?.[0]?.payments?.authorizations?.[0];
          resultMessage(
            `Transaction ${transaction.status}: ${transaction.id}<br>
          <br>See console for all available details`
          );
          console.log(
            "Capture result",
            orderData,
            JSON.stringify(orderData, null, 2)
          );
        }
      } catch (error) {
        console.error(error);
        resultMessage(
          `Sorry, your transaction could not be processed...<br><br>${error}`
        );
      }
    },
  })
  .render("#paypal-button-container");
}
// Example function to show a result to the user. Your site's UI library can be used instead.
function resultMessage(message) {
  const container = document.querySelector("#result-message");
  container.innerHTML = message;
}
// Function to dynamically replace a coin package's button with PayPal
function renderPayPalButton(parent, amount) {
   /* parent.innerHTML = ''; // Clear the coin package

    // Add a PayPal container
    const paypalContainer = document.createElement('div');
    paypalContainer.id = `paypal-button-${amount}`;
    parent.appendChild(paypalContainer);*/
    var paypalBtn = document.getElementById("paypal-button-container");
    paypalBtn.innerHTML = '';
    makePaypalBtn(amount / 10);
    // Render PayPal button for the given amount
    /*paypal.Buttons({
        createOrder: function (data, actions) {
            return actions.order.create({
                purchase_units: [
                    {
                        amount: {
                            value: (amount / 10).toFixed(2), // Assume conversion of coins to GBP
                        },
                    },
                ],
            });
        },
        onApprove: function (data, actions) {
            return actions.order.capture().then(function (details) {
                console.log(`Transaction completed by ${details.payer.name.given_name}`);

                // Display a success message
                const successMessage = document.createElement('p');
                successMessage.textContent = `${amount} coins successfully purchased!`;
                parent.innerHTML = ''; // Clear the PayPal button
                parent.appendChild(successMessage);

                // Add a new "Order Again" button
                const newButton = document.createElement('button');
                newButton.textContent = 'Order Again';
                newButton.onclick = () => renderPayPalButton(parent, amount);
                parent.appendChild(newButton);

                // Update coins in profile
                updateCoinDisplay(amount);
            });
        },
        onError: function (err) {
            console.error('PayPal Checkout Error:', err);
            alert('An error occurred during the transaction. Please try again.');
        },
    }).render(`#paypal-button-${amount}`);*/
}

// Function to buy coins and initiate PayPal button rendering
function buyCoins(amount) {
    const button = event.target;
    const parent = button.parentNode;

    renderPayPalButton(parent, amount);
}


