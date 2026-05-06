# Gamtiles Digital Atelier

TODO: Document your project here
Inline payment modempay ui:
> ## Documentation Index
> Fetch the complete documentation index at: https://docs.modempay.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Inline Modem Payment

Modem Pay's inline integration allows you to seamlessly add a payment option directly to your website, enabling your customers to make payments without leaving the page. This integration provides a smooth and efficient checkout process, ideal for businesses looking to enhance user experience and maximize conversion rates.

By using this integration, you can implement a "Pay Now" button that triggers a payment flow directly on your site, avoiding pop-ups or redirects. This is especially useful for scenarios like product purchases, service subscriptions, or event ticket sales.

## Example: Setting Up Inline Payment

```html html theme={null}
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Modem Pay</title>
    <link rel="stylesheet" href="https://api.modempay.com/dist/main.css" />
    <script src="https://api.modempay.com/js/v1.js"></script>
  </head>
  <body>
    <h1>Inline Payment Example</h1>
    <button type="button" onclick="makePayment()" id="start-payment-button">
      Pay Now
    </button>

    <script>
      function makePayment() {
        const modal = ModemPayCheckout({
          amount: 450,
          public_key:
            "pk_test_e073bbf9db47b09cebfdf2f7ec147d02116b69ea55135e1747a0bc8d47612f69",
          payment_methods: "wallet,card,bank",
          callback: (transaction) => {
            console.log("Payment completed:", transaction);
            // Handle post-payment actions
            modal.close();
          },
          onClose: (cancelled) => {
            if (cancelled) {
              console.log("Payment was cancelled.");
              // Handle payment cancellation
            }
          },
        });
      }
    </script>
  </body>
</html>
```

## Calling the ModemPayCheckout() Function

Let's examine the parameters provided when invoking `ModemPayCheckout()` in detail:

| **Field**         | **Description**                                                     | **Example**                              |
| ----------------- | ------------------------------------------------------------------- | ---------------------------------------- |
| `amount`          | The amount to be charged.                                           | `450` (for GMD 450.00)                   |
| `currency`        | The transaction currency (default: GMD).                            | `"GMD"`                                  |
| `payment_methods` | Available payment methods (`card`, `wallet`, `bank`).               | `"card,wallet,bank"`                     |
| `title`           | A short title describing the transaction.                           | `"Course Payment"`                       |
| `description`     | Detailed description of the transaction.                            | `"Access to Premium Content"`            |
| `customer`        | A unique identifier for the customer.                               | `"7e1908bb-bd62-4d20-9af7-3463a150fd98"` |
| `customer_email`  | Customer's email address.                                           | `"customer@example.com"`                 |
| `customer_name`   | Full name of the customer.                                          | `"John Doe"`                             |
| `customer_phone`  | Customer's phone number.                                            | `"7000000"`                              |
| `metadata`        | A JSON object for additional payment information.                   | `{ "order_id": "98765" }`                |
| `return_url`      | URL to redirect to after successful payment.                        | `"https://yourwebsite.com/success"`      |
| `cancel_url`      | URL to redirect to if the payment is canceled.                      | `"https://yourwebsite.com/cancel"`       |
| `callback`        | Function to handle post-payment actions.                            | `(transaction) => { ... }`               |
| `onClose`         | Function to handle when the modal is closed or payment is canceled. | `(cancelled) => { ... }`                 |

<Warning>
  **Public Key**

  Keep in mind that this is client-side code, so it utilizes your public key rather than your secret key.
</Warning>

## How Callbacks and onClose Work

Here's an example that demonstrates how to use both the `callback` and `onClose` functions. The `callback` function sends a verification request to the backend in the background. Meanwhile, the `onClose` function handles the modal closure by displaying a "verifying" message if the background request is still in progress, or a thank-you message if the verification succeeds. If the verification fails, the user is prompted to retry or contact support.

> **View**: [https://codepen.io/mercury-sms/embed/EaYNGOv](https://codepen.io/mercury-sms/embed/EaYNGOv?default-tab=html%2Cresult)

### **`callback`: Handling Successful Payments**

The `callback` function allows you to perform actions after a successful payment. For instance, you can verify the transaction, send a confirmation email, or update your database. The `transaction` parameter contains essential information about the payment.

<Warning>
  The `redirect_url` takes priority over the `callback`. If both are provided, the `redirect_url` will be used.
</Warning>

```javascript javascript theme={null}
function makePayment() {
  const modal = ModemPayCheckout({
    public_key:
      "pk_test_e073bbf9db47b09cebfdf2f7ec147d02116b69ea55135e1747a0bc8d47612f69",
    // ...
    callback: function (transaction) {
      // Handle the transaction success and verify on backend
      verifyTransactionOnBackend(transaction.id, modal);
    },
  });
}
```

<Warning>
  Always verify the payment on your server after the transaction, even if a callback was used.
</Warning>

<Note>
  Keep in mind that the `callback` function is triggered after the payment is completed, even while the modal remains open. For an enhanced user experience, you can combine the `callback` with the `onClose` handler.
</Note>

### **`onClose`: Handling Payment Cancellations**

The `onClose` function is invoked when the customer cancels the payment by closing the modal. This is particularly useful for logging or notifying users of incomplete transactions.

```javascript javascript theme={null}
function makePayment() {
  const modal = ModemPayCheckout({
    public_key:
      "pk_test_e073bbf9db47b09cebfdf2f7ec147d02116b69ea55135e1747a0bc8d47612f69",
    // ...
    onClose: function (cancelled) {
      if (cancelled) {
        // handle cancellation
      }
    },
  });
}
```

### Precedence Between `callback`, `return_url`, and `onClose`

* **`return_url` vs `callback`:**\
  If both are provided, the `return_url` will take precedence, and the user will be redirected to the specified URL after the payment instead of executing the `callback` function.

* **`cancel_url` vs `onClose`:**\
  If a `cancel_url` is provided, it overrides the `onClose` function, and the user will be redirected to the specified URL upon cancellation.

## Webhooks

If you have configured [webhook notifications](/documentation/core/webhooks) for your account, we will send a webhook when the payment is completed, as well as for any failed payment attempts. Here's an example of the webhook payload:

```json theme={null}
{
  "event": "charge.succeeded",
  "payload": {
    "id": "23419194-7324-4c2b-a74b-d8fba736e692",
    "type": "payment",
    "amount": 2500,
    "currency": "GMD",
    "payment_method": "qmoney",
    "customer": "0f6e0912-2f2f-4d8b-bd68-ac8c97c44ae6",
    "metadata": {},
    "status": "completed",
    "payment_link_id": null,
    "custom_fields_values": {},
    "business_id": "a10a51ae-05c8-406e-968c-7b1d309a77e0",
    "account_id": "7788dd90-3801-47a6-8597-b46eaa0a7d7d",
    "test_mode": true,
    "customer_name": "Zypheron Kade",
    "customer_phone": "7024725",
    "customer_email": "calebchibuike110@gmail.com",
    "createdAt": "2024-12-15T09:34:17.036Z",
    "updatedAt": "2024-12-15T09:34:43.306Z",
    "payment_account": ".... 9944",
    "payment_metadata": {
      "os": "MacOS",
      "browser": "Firefox",
      "ipAddress": "196.223.149.183",
      "timestamp": "2024-12-15T09:34:43.266Z",
      "deviceType": "Desktop",
      "urlIPAddress": "https://db-ip.com/196.223.149.183",
      "screenResolution": "1600x900"
    },
    "payment_intent_id": "273ac751-369d-4198-8340-da480208bded",
    "transaction_reference": "VOAO1CFEN7",
    "payment_method_id": "4dbaaec5-7a16-4908-8fd9-c3d2bd24f739"
  }
}
```

## Why Use Inline Payments?

Inline payment integrations provide a frictionless experience by letting users complete payments without leaving your page. This approach minimizes drop-offs during checkout and enhances customer satisfaction.

**Perfect for:**

* **E-commerce Sites:** Add quick payment buttons on product pages.
* **Subscription Services:** Charge for recurring services effortlessly.
* **Event Ticketing:** Allow customers to book and pay on the same page.

By incorporating features like `callback` and `onClose`, you gain full control over the payment flow and can provide a seamless experience tailored to your users' needs.


Payment intent modempay:> ## Documentation Index
> Fetch the complete documentation index at: https://docs.modempay.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Payment Intents

A **Payment Intent** in Modem Pay represents a user's intention to pay a specified amount. It is used to initiate a payment process and generate a link for the customer to complete the transaction securely.

### Payment Intent Object

The **Payment Intent** object contains the following properties:

* **amount**: The total amount to be paid.
* **currency**: The currency of the payment (optional).
* **payment\_methods**: A list of accepted payment methods (optional) (e.g., "card", "bank", "wallet").
* **title**: A title for the payment (optional).
* **description**: A description of the payment (optional).
* **customer**: The ID of the customer making the payment (optional).
* **customer\_name**: The name of the customer making the payment (optional).
* **customer\_email**: The email address of the customer making the payment (optional).
* **customer\_phone**: The phone number of the customer making the payment (optional).
* **metadata**: Any additional information about the payment (optional).
* **return\_url**: The URL to which the customer is redirected after a successful payment (optional).
* **cancel\_url**: The URL to which the customer is redirected if they cancel the payment (optional).
* **payment\_method**: The specific payment method to use (optional).
* **coupon**: The ID of a coupon to apply to the payment (optional). If provided, the coupon's discount will be applied to the payment amount.
* **callback\_url**: The endpoint where Modem Pay will send a webhook notification after the payment has been processed.
* **skip\_url\_validation**: Set to `true` to bypass Modem Pay's validation of the `cancel_url` or `return_url`. This is most commonly needed when these URLs use mobile app deeplinks, allowing you to return users directly into your app.

#### Payment Intent Response Object

These are the response properties after the Payment Intent is created:

* **status**: A boolean value indicating whether the payment intent creation was successful. Returns `true` if successful, `false` otherwise.
* **message**: A descriptive message about the result of the Payment Intent creation (e.g., "Payment intent created successfully. Please proceed to complete the payment.").
* **data**: An object containing the details of the payment intent. The properties inside this object are:
  * **intent\_secret**: A secret key used to secure the payment intent, required for completing the payment.
  * **payment\_link**: A URL to the hosted payment page where the customer can complete the payment.
  * **amount**: The total amount to be paid, expressed in the currency specified in **currency**.
  * **currency**: The currency code (e.g., `GMD` for Gambian Dalasi) in which the payment is to be made.
  * **expires\_at**: A timestamp (ISO 8601 format) indicating when the payment intent will expire. After this time, the payment intent will no longer be valid.
  * **status**: The current status of the payment intent. It can be one of the following:
    * `requires_payment_method`: Payment method is required before proceeding.
    * `processing`: The payment is currently being processed.
    * `successful`: The payment was successfully completed.
    * `failed`: The payment failed to process.
    * `cancelled`: The payment was canceled by the customer or the system.

### Summary

Payment Intents in Modem Pay are used to initiate and manage the payment flow. By grouping parameters and responses in a structured way, they allow businesses to control how and when payments are processed while providing a seamless experience for their customers.


Create payment intent:> ## Documentation Index
> Fetch the complete documentation index at: https://docs.modempay.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Create a Payment Intent

The **Payment Intent** represents an intention to complete a payment. You can create a Payment Intent by specifying key details like the payment amount, the customer, and the payment method.

<iframe width="100%" height="425" src="https://www.youtube.com/embed/Gox1JSWZYdg?si=YoJPOWZHxGNiaRUt" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

#### General Workflow

To create a payment intent, you generally follow these steps:

1. Specify the amount the customer needs to pay.
2. Optionally, provide additional information such as the customer details, payment methods, and redirect URLs.
3. Receive a link to the payment page, where the customer can complete the payment.

***

### Scenarios for Creating a Payment Intent

#### 1. **Creating a Payment Intent with Just Amount**

In this simplest scenario, you only need to provide the amount that needs to be paid. This is the most basic setup for a payment.

* **Scenario**: You want to create a payment intent for a customer to pay GMD 450, but you do not specify a customer or any other optional parameters.
* **Request**:

<CodeGroup>
  ```javascript nodejs  theme={null}
  const paymentIntent = await modempay.paymentIntents.create({ amount: 450 });
  ```

  ```python python  theme={null}
  payment_intent = modem_pay.payment_intents.create(params={"amount": 450})
  ```

  ```php php  theme={null}
  $payment_intent = $modemPay->paymentIntents()->create(['amount' => 450]);
  ```

  ```bash cURL  theme={null}
  cURL -X POST "https://api.modempay.com/v1/payments" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <your_api_key>" \
    -d '{
      "data": {
        "amount": 450,
        "from_sdk": false
      }
    }'
  ```
</CodeGroup>

* **Result**: A Payment Intent is created with a link to the payment page, where the customer can complete the payment.

```json theme={null}
{
  "status": true,
  "message": "Payment intent created successfully. Please proceed to complete the payment.",
  "data": {
    "intent_secret": "8816a8e679d9df252fa80d09ebe21efaa3a8980cb053cb64afeed44c5df696f4",
    "payment_link": "https://test.checkout.modempay.com/6b63ccef-0232-4be1-b53d-be6823767874",
    "amount": 450,
    "currency": "GMD",
    "expires_at": "2025-02-13T12:31:15.601Z",
    "status": "requires_payment_method"
  }
}
```

#### 2. **Creating a Payment Intent with Amount and Customer**

In this scenario, in addition to specifying the amount, you also specify the customer who will be making the payment. This helps associate the payment with a particular customer for better tracking.

* **Scenario**: You want to create a payment intent for GMD 450 and associate it with a specific customer.
* **Request**:

<CodeGroup>
  ```javascript nodejs  theme={null}
  const paymentIntent = await modempay.paymentIntents.create({
      amount: 450,
      customer: "d9bf8831-4db5-4a1c-8aa0-3de72492f330",
  });
  ```

  ```python python  theme={null}
  payment_intent = modem_pay.payment_intents.create(
      params={"amount": 450, "customer": "d9bf8831-4db5-4a1c-8aa0-3de72492f330"}
  )
  ```

  ```php php  theme={null}
  $payment_intent = $modemPay->paymentIntents()->create([
      'amount' => 450,
      'customer' => 'd9bf8831-4db5-4a1c-8aa0-3de72492f330',
  ]);
  ```

  ```bash cURL  theme={null}
  cURL -X POST "https://api.modempay.com/v1/payments" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <your_api_key>" \
    -d '{
      "data": {
        "amount": 450,
        "customer": "d9bf8831-4db5-4a1c-8aa0-3de72492f330",
        "from_sdk": false
      }
    }'
  ```
</CodeGroup>

#### 3. **Creating a Payment Intent with Amount, Customer, and Payment Methods**

This scenario involves a more specific setup where you specify the amount, associate the intent with a customer, and predefine the payment methods the customer will use. This is useful when you want to guarantee specific methods of payment.

* **Scenario**: You want to create a payment intent for GMD 450, associate it with a customer, and specify that the payment should be processed using a particular payment method.
* **Request**:

<CodeGroup>
  ```javascript nodejs  theme={null}
  const paymentIntent = await modempay.paymentIntents.create({
      amount: 450,
      customer: "d9bf8831-4db5-4a1c-8aa0-3de72492f330",
      payment_methods: ["card"],
  });
  ```

  ```python python  theme={null}
  payment_intent = modem_pay.payment_intents.create(
      params={
          "amount": 450,
          "customer": "d9bf8831-4db5-4a1c-8aa0-3de72492f330",
          "payment_methods": ["card"],
      }
  )
  ```

  ```php php  theme={null}
  $payment_intent = $modemPay->paymentIntents()->create([
      'amount' => 450,
      'customer' => 'd9bf8831-4db5-4a1c-8aa0-3de72492f330',
      'payment_methods' => ['card'],
  ]);
  ```

  ```bash cURL  theme={null}
  cURL -X POST "https://api.modempay.com/v1/payments" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <your_api_key>" \
    -d '{
      "data": {
        "amount": 450,
        "customer": "d9bf8831-4db5-4a1c-8aa0-3de72492f330",
        "payment_methods": ["card"],
        "from_sdk": false
      }
    }'
  ```
</CodeGroup>

#### 4. **Creating a Payment Intent with Amount, Customer, and Specific Payment Method ID**

In this scenario, you create a Payment Intent specifying a particular customer's payment method ID. This is useful when you want to charge a customer using a specific saved payment method, such as a stored card or bank account.

* **Scenario**: You want to create a payment intent for GMD 450, associate it with a specific customer, and use a specific saved payment method ID from the customer’s account. This setup allows you to charge a saved payment method directly, streamlining the payment process for returning customers.

* **Request**:

<CodeGroup>
  ```javascript nodejs  theme={null}
  const paymentIntent = await modempay.paymentIntents.create({
      amount: 450,
      payment_method: "ad47ccb9-687c-475b-90dc-1dd3b4cba68e",
      customer: "d9bf8831-4db5-4a1c-8aa0-3de72492f330",
  });
  ```

  ```python python  theme={null}
  payment_intent = modem_pay.payment_intents.create(
      params={
          "amount": 450,
          "payment_method": "ad47ccb9-687c-475b-90dc-1dd3b4cba68e",
          "customer": "d9bf8831-4db5-4a1c-8aa0-3de72492f330",
      }
  )
  ```

  ```php php  theme={null}
  $payment_intent = $modemPay->paymentIntents()->create([
      'amount' => 450,
      'payment_method' => 'ad47ccb9-687c-475b-90dc-1dd3b4cba68e',
      'customer' => 'd9bf8831-4db5-4a1c-8aa0-3de72492f330',
  ]);
  ```

  ```bash cURL  theme={null}
  cURL -X POST "https://api.modempay.com/v1/payments" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <your_api_key>" \
    -d '{
      "data": {
        "amount": 450,
        "customer": "d9bf8831-4db5-4a1c-8aa0-3de72492f330",
        "payment_method": "ad47ccb9-687c-475b-90dc-1dd3b4cba68e",
        "from_sdk": false
      }
    }'
  ```
</CodeGroup>

***

### Common Optional Parameters for Creating a Payment Intent

While the **amount** is the only required parameter for creating a payment intent, you can optionally include other parameters to enhance the payment flow:

* **currency**: The currency for the payment (optional). If omitted, the default currency will be used.
* **title**: A title for the payment (optional).
* **description**: A description of the payment (optional).
* **metadata**: Any additional custom data (optional).
* **return\_url**: A URL to which the customer will be redirected after completing the payment (optional).
* **cancel\_url**: A URL to which the customer will be redirected if they cancel the payment (optional).
* **payment\_methods**: A list of accepted payment methods (optional).

***

### Conclusion

Creating a Payment Intent is a straightforward process. By specifying just the **amount**, or additionally associating the intent with a **customer** and **payment method**, you can tailor the payment flow to meet specific needs. Once created, you will receive a unique link that the customer can use to complete the payment. This flexible setup ensures a seamless payment experience.


Refunds:> ## Documentation Index
> Fetch the complete documentation index at: https://docs.modempay.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Refunds

Refunds allow you to reverse a completed payment, either partially or in full, by returning funds to the customer. Common scenarios for refunds include order cancellations, duplicate payments, or fulfillment issues. Modem Pay makes it simple to issue refunds via the API.

### Important Refund Policies

* **Eligibility:** Refunds are only allowed on transactions that have a **completed** status.
* **Refund Window:** The refund request must be made within **48 hours** of the original transaction’s completion.
* **Partial Refunds:** To issue a partial refund, specify the `amount` in the request body. The partial refund amount **cannot exceed** the original transaction amount.
* **Charges:** Charges may apply when processing a refund.
* **Transaction Reference:** Always use the **reference** to identify the payment you want to refund.

### When to Issue a Refund

You might want to issue a refund when:

* The customer cancels their purchase after payment.
* An incorrect amount was charged.
* The goods or services could not be provided.
* You need to comply with a return or cancellation policy.

Refunds can be processed for the full or partial amount of the original payment as long as they meet the above criteria.

## Issuing a Refund

To issue a refund for a specific payment, call the refund endpoint and provide the **reference** of the original transaction. You can also specify the `amount` to refund if you want to perform a partial refund. *If `amount` is omitted, a full refund will be processed.*

### Example: Refund via cURL

<CodeGroup>
  ```typescript nodejs theme={null}
  await modempay.transactions.refund("cos-245wvm6588xrp", 450);
  // Optional: omit amount for full refund
  ```

  ```bash cURL theme={null}
  cURL -X POST "https://api.modempay.com/v1/transactions/refund" \
    -H "Authorization: Bearer <your_api_key>" \
    -H "Content-Type: application/json" \
    -d '{
      "reference": "cos-245wvm6588xrp",
      "amount": 450
    }'
  # Optional: omit amount for full refund
  ```
</CodeGroup>

Refund requests are typically processed immediately, but it may take some time for the funds to settle back to your customer's payment method depending on their bank or card provider. Make sure you communicate clearly with your customers during the refund process. Note that refunds are subject to the conditions above and that processing charges may apply.

Manage the paument intent:> ## Documentation Index
> Fetch the complete documentation index at: https://docs.modempay.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Manage Payment Intent

The Modem Pay SDK provides straightforward methods to manage Payment Intents beyond creating them, allowing you to cancel, retrieve, and list Payment Intents easily.

***

#### Cancel a Payment Intent

If a payment session is no longer needed, you can cancel a Payment Intent. Once canceled, the Payment Intent can’t be completed, which is useful for handling expired or abandoned payments.

**Parameters:**

* `id` *(string)*: The unique identifier of the Payment Intent you wish to cancel.

<CodeGroup>
  ```javascript nodejs theme={null}
  const paymentIntent = await modempay.paymentIntents.cancel(
      "49ac6595-beba-480f-bc3d-33e5d4162c4c"
  );
  ```

  ```python python theme={null}
  payment_intent = modem_pay.payment_intents.cancel(
      "49ac6595-beba-480f-bc3d-33e5d4162c4c"
  )
  ```

  ```php php theme={null}
  $payment_intent = $modemPay->paymentIntents()->cancel(
      "49ac6595-beba-480f-bc3d-33e5d4162c4c"
  );
  ```

  ```bash cURL theme={null}
  cURL -X PATCH "https://api.modempay.com/v1/payments/<payment_intent_id>" \
    -H "Authorization: Bearer <your_api_key>"
  ```
</CodeGroup>

**Response:**
Returns the canceled Payment Intent object, updating its status to `"cancelled"`.

```json theme={null}
{
  ...
  "status": "cancelled"
}
```

***

#### Retrieve a Payment Intent

To check the current status or details of an existing Payment Intent, you can retrieve it by the secret. This is especially useful for confirming the progress or outcome of a payment attempt.

**Parameters:**

* `intent_secret` *(string)*: The unique secret of the Payment Intent you’re retrieving.

<CodeGroup>
  ```javascript nodejs theme={null}
  const paymentIntent = await modempay.paymentIntents.retrieve(
      "bfa7eb3ea516ee15f80915a922c00242a77629eb5b1efe34048b83a61925bbf5"
  );
  ```

  ```python python theme={null}
  payment_intent = modem_pay.payment_intents.retrieve(
      "bfa7eb3ea516ee15f80915a922c00242a77629eb5b1efe34048b83a61925bbf5"
  )
  ```

  ```php php theme={null}
  $payment_intent = $modemPay->paymentIntents()->retrieve(
      "49ac6595-beba-480f-bc3d-33e5d4162c4c"
  );
  ```

  ```bash cURL theme={null}
  cURL -X GET "https://api.modempay.com/v1/payments/verify?intent_secret=<intent_secret>" \
    -H "Authorization: Bearer <your_api_key>"
  ```
</CodeGroup>

**Response:**
Returns the Payment Intent object, including attributes such as:

* **status**: Shows if the intent is `"initialized"`, `"processing"`, `"successful"`, etc.
* **amount, currency, description**: Reflects the payment details initially set.
* **link**: The unique payment link for the intent.
* **customer**: Linked customer details, if available.

***

#### List Payment Intents

To view a collection of recent Payment Intents, use the `list` method. This is ideal for tracking activity, viewing recent payment attempts, or obtaining an overview of intents by status.

**Parameters:**

* `limit` *(number, optional)*: The number of Payment Intents to retrieve (default is typically 10).

<CodeGroup>
  ```javascript nodejs theme={null}
  const paymentIntents = await modempay.paymentIntents.list({ limit: 10 });
  ```

  ```python python theme={null}
  payment_intents = modem_pay.payment_intents.list(options={"limit": 10})
  ```

  ```php php theme={null}
  $payment_intents = $modemPay->paymentIntents()->list(['limit' => 10]);
  ```

  ```bash cURL theme={null}
  cURL -X GET "https://api.modempay.com/v1/payments?offset=0&limit=10" \
    -H "Authorization: Bearer <your_api_key>"
  ```
</CodeGroup>

**Response:**

```json theme={null}
{
  "data": [],
  "meta": {
    "total": 31
  }
}

```
mobile money payout:> ## Documentation Index
> Fetch the complete documentation index at: https://docs.modempay.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Mobile Money Payouts

Mobile money is one of the most popular and accessible methods of transferring funds in The Gambia and across West Africa. Modem Pay supports seamless transfers to major mobile money providers.

### Supported Networks

Here are the currently supported mobile money networks on Modem Pay:

| Network  | Key (`network`) | Notes                       |
| -------- | --------------- | --------------------------- |
| Africell | `afrimoney`     | Instant transfers supported |
| Wave     | `wave`          | Instant transfers supported |

<Note>
  You must specify the correct `network` value in your transfer request.
</Note>

### Required Fields

For mobile money transfers, you must provide the following in your request:

| Field              | Required | Description                      |
| ------------------ | -------- | -------------------------------- |
| `amount`           | ✅        | Amount to send                   |
| `currency`         | ✅        | Currency code (e.g., `GMD`)      |
| `network`          | ✅        | One of: `afrimoney`, `wave`      |
| `account_number`   | ✅        | Recipient's mobile wallet number |
| `beneficiary_name` | ✅        | Name of the wallet holder        |
| `narration`        | ⛔        | Optional transfer note           |
| `metadata`         | ⛔        | Optional structured data (JSON)  |

### Initiate Payout

<Note>
  When initiating a transfer, you must provide an <b>Idempotency-Key</b> in the request header. This ensures that if the same request is sent multiple times (for example, due to network issues), only one transfer will be processed. The <b>Idempotency-Key</b> should be a unique value (such as a UUID) for each transfer request.
</Note>

<CodeGroup>
  ```typescript nodejs theme={null}
  import ModemPay from "modem-pay";

  const modemPay = new ModemPay("sk_test_...");

  const response = await modemPay.transfers.initiate({
    amount: 100,
    currency: "GMD",
    network: "afrimoney",
    account_number: "7834567",
    beneficiary_name: "John Doe",
    narration: "Vendor payment for April supplies",
    metadata: {
      vendor_id: "vendor_001",
      invoice_id: "inv_204"
    }
  }, "Idempotency-Key");
  ```

  ```python python theme={null}
  from modempay import ModemPay

  modem_pay = ModemPay(api_key="sk_test_...")

  response = modem_pay.transfers.initiate(
      params={
          "amount": 100,
          "currency": "GMD",
          "network": "afrimoney",
          "account_number": "7834567",
          "beneficiary_name": "John Doe",
          "narration": "Vendor payment for April supplies",
          "metadata": {"vendor_id": "vendor_001", "invoice_id": "inv_204"},
      },
      idempotency_key="Idempotency-Key"
  )
  ```

  ```php php theme={null}
  use ModemPay\ModemPay;

  $modemPay = new ModemPay('sk_test_...');

  $transfer = $modemPay->transfers()->initiate([
      'amount' => 100,
      'currency' => 'GMD',
      'account_number' => '7834567',
      'network' => 'afrimoney',
      'beneficiary_name' => 'John Doe',
      'narration' => 'Vendor payment for April supplies',
      'metadata' => [
        'vendor_id' => 'vendor_001',
        'invoice_id' => 'inv_204',
      ],
  ], 'Idempotency-Key');
  ```

  ```bash cURL theme={null}
  curl -X POST https://api.modempay.com/v1/transfers \
    -H "Authorization: Bearer sk_test_..." \
    -H "Content-Type: application/json" \
    -H "Idempotency-Key: Idempotency-Key" \
    -d '{
      "amount": 100,
      "currency": "GMD",
      "network": "afrimoney",
      "account_number": "7834567",
      "beneficiary_name": "John Doe",
      "narration": "Vendor payment for April supplies",
      "metadata": {
        "vendor_id": "vendor_001",
        "invoice_id": "inv_204"
      }
    }'

  ```
</CodeGroup>

### Payout Response

```typescript json theme={null}
{
  "id": "45eb796c-e66a-442f-bba2-d282053f8883",
  "events": {},
  "business_id": "120c298f-b736-49c1-8220-8a8c84a5d8f3",
  "account_id": "199bf17b-0b5a-45c0-a5b0-1d29f5f173c9",
  "amount": 100,
  "currency": "GMD",
  "type": "mobile-money",
  "balance_before": 995,
  "balance_after": 894,
  "transfer_reference": "5Np7iVHrN",
  "test_mode": true,
  "status": "completed",
  "account_name": "John Doe",
  "network": "afrimoney",
  "mobile_number": "7834567",
  "account_number": "7834567",
  "note": "Vendor payment for April supplies",
  "fee": 1,
  "metadata": {
    "vendor_id": "vendor_001",
    "invoice_id": "inv_204"
  },
  "updatedAt": "2025-05-05T21:12:52.839Z",
  "createdAt": "2025-05-05T21:12:52.839Z",
  "merchant_id": null,
  "recipient_business_id": null,
  "bank": null,
  "amount_received": null,
  "otp": null
}
```

### Retrieve a Payout

You can fetch the details of a specific transfer using its unique `id`.

<CodeGroup>
  ```typescript nodejs theme={null}
  const transfer = await modemPay.transfers.retrieve("45eb796c...");
  console.log(transfer.status); // e.g., 'completed'
  ```

  ```python python theme={null}
  transfer = modem_pay.transfers.retrieve("45eb796c...")
  print(transfer["status"]); # e.g., 'completed'
  ```

  ```php php theme={null}
  $transfer = $modemPay->transfers()->retrieve("45eb796c...");
  echo $transfer->status; # e.g., 'completed'
  ```

  ```bash cURL theme={null}
  curl -X GET https://api.modempay.com/v1/transfers/45eb796c... \
    -H "Authorization: Bearer sk_test_..."
  ```
</CodeGroup>

This returns the full transfer object with all metadata, status, and transaction history.

### Fraud Monitoring & Security

Modem Pay automatically monitors all payout transfers for suspicious or anomalous activity. If a transfer triggers our fraud detection systems, it is immediately flagged for review. When this happens:

* You will receive an email notification alerting you to the flagged transfer.
* A `transfer.flagged` webhook event will be sent to your configured webhook endpoint.

**Important:** No further transfers can be made to the affected account number until you review and resolve the flagged issue. This helps protect your business and recipients from potential fraud or misuse. Always investigate flagged transfers promptly to restore normal payout operations.


overview:> ## Documentation Index
> Fetch the complete documentation index at: https://docs.modempay.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Overview

The Modem Pay Payouts API allows you to send funds from your business account to users, vendors, or other accounts. Payouts can be made via mobile money, internal (Modem Pay) transfers, or bank transfers (coming soon).

Use cases include:

* User withdrawals
* Vendor payouts
* Payroll and salary disbursements

### Payout Parameters

Here’s the general shape of a transfer request:

```typescript typescript theme={null}
type TransferParams = {
  amount: number;
  currency: string;
  narration?: string;
  network: string;
  beneficiary_name: string;
  account_number: string;
  metadata?: object;
  callback_url?: string;
};
```

* `amount` – The amount to send.
* `currency` – Currency code (e.g., `GMD`, `USD`).
* `network` – Mobile money provider or transfer channel.
* `account_number` – Destination account (phone or bank account).
* `beneficiary_name` – Name of the recipient.
* `metadata` – Optional key-value pairs for internal tracking.
* `callback_url` – The endpoint where Modem Pay will send a webhook notification after the payout has been processed.

### Payout Object

Once initiated, a transfer is represented as:

```typescript typescript theme={null}
type Transfer = {
  id: string;
  business_id: string;
  account_id: string;
  amount: number;
  currency: string;
  type: "self" | "modem-pay" | "mobile-money" | "bank";
  status: "pending" | "completed" | "failed" | "cancelled";
  fee: number;
  balance_before: number;
  balance_after: number;
  transfer_reference: string;
  metadata: object;
  // Optional fields based on type
  network?: string;
  account_number?: string;
  mobile_number?: string;
  bank?: string;
  amount_received?: number;
  otp?: string;
  test_mode: boolean;
  events: object;
  note?: string;
  callback_url?: string;
};
```

This object is returned on creation and is also sent to your webhook endpoint when status updates occur.

### Webhooks

Payouts are asynchronous and may trigger the following webhook events:

* `transfer.succeeded`
* `transfer.failed`
* `transfer.reversed`
* `transfer.flagged`

 payout fees:> ## Documentation Index
> Fetch the complete documentation index at: https://docs.modempay.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Payout Fees

With Modem Pay, you can check how much a transfer will cost before proceeding. This allows you to estimate the total amount, including any fees that will be applied based on the payment network and transfer amount.

### Check Payout Fees

To check the fee for a transfer, use the `/v1/transfers/fees` endpoint. You can specify the transfer amount, currency, and network to get an estimate of the transfer fee.

#### Request Parameters

| Field      | Type     | Description                                           |
| ---------- | -------- | ----------------------------------------------------- |
| `amount`   | `number` | The amount to be transferred.                         |
| `currency` | `string` | The currency code (e.g., "GMD", "USD").               |
| `network`  | `string` | The payment network used (e.g., "afrimoney", "wave"). |

#### Response

The response will include the transfer fee, the currency of the fee, and the amount that will be sent.

| Field      | Type     | Description                                                            |
| ---------- | -------- | ---------------------------------------------------------------------- |
| `fee`      | `number` | The fee for the transfer.                                              |
| `currency` | `string` | The currency code of the fee (e.g., "GMD", "USD").                     |
| `network`  | `string` | The payment network used for the transfer (e.g., "afrimoney", "wave"). |
| `amount`   | `number` | The total amount to be transferred.                                    |

### Example

<CodeGroup>
  ```typescript nodejs theme={null}
  import ModemPay from "modem-pay";

  const modemPay = new ModemPay("sk_test_...");

  const feeResponse = await modemPay.transfers.fee({
    amount: 1000,
    currency: "GMD",
    network: "afrimoney"
  });

  console.log(`Payout fee: ${feeResponse.fee} ${feeResponse.currency}`);
  console.log(`Total amount: ${feeResponse.amount} ${feeResponse.currency}`);
  ```

  ```python python theme={null}
  from modempay import ModemPay

  modem_pay = ModemPay(api_key="sk_test_...")

  fee_response = modem_pay.transfers.fee(
      {"amount": 1000, "currency": "GMD", "network": "afrimoney"}
  )

  print(f"Payout fee: {fee_response['fee']} {fee_response['currency']}")
  print(f"Total amount: {fee_response['amount']} {fee_response['currency']}")
  ```

  ```php php theme={null}
  use ModemPay\ModemPay;

  $modemPay = new ModemPay('sk_test_...');

  $fee_response = $modemPay->transfers()->fee([
      'amount' => 1000,
      'currency' => 'GMD',
      'network' => 'afrimoney',
  ]);

  print_r($fee_response);
  ```

  ```bash cURL theme={null}
  curl -X POST https://api.modempay.com/v1/transfers/fees \
    -H "Authorization: Bearer sk_test_..." \
    -H "Content-Type: application/json" \
    -d '{
      "amount": 1000,
      "currency": "GMD",
      "network": "afrimoney"
    }'
  ```
</CodeGroup>

### Example Response

The following is a sample response returned from the API after querying the transfer fee:

```json theme={null}
{
  "fee": 5,
  "currency": "GMD",
  "network": "afrimoney",
  "amount": 1000
}
```

In this example, the transfer fee is **5 GMD**, and the total amount to be debited (including fees) is **1,005 GMD**.
 
 split payment overview:> ## Documentation Index
> Fetch the complete documentation index at: https://docs.modempay.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Overview

With **Split Payments**, you can share the settlement of a transaction with one or more sub-accounts. This allows you to automatically distribute revenue between multiple parties without manual transfers or spreadsheets.

Whether you’re running a marketplace, school, agency, or any business that needs to share revenue, Split Payments makes it easy to:

* **Create sub-accounts:** Assign each recipient their own account within Modem Pay.
* **Set revenue percentages:** Decide what portion of a transaction each sub-account receives.
* **Automate settlements:** Modem Pay calculates and distributes payouts according to the defined splits.

**Example:**
A customer pays **1,000 GMD**. You have a sub-account set up to receive **10%**, and your main business account receives **90%**. After the transaction is processed:

* Main account balance: 900 GMD
* Sub-account balance: 100 GMD

This removes the headache of manual revenue sharing, ensures transparency, and keeps your business and partners’ payouts accurate and timely.
 
sup account:> ## Documentation Index
> Fetch the complete documentation index at: https://docs.modempay.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Sub-Accounts

Sub-accounts are the backbone of **Split Payments**. They define who receives a portion of a transaction and where that money should go. Each sub-account can have a **percentage of the transaction** and a **settlement destination**.

With sub-accounts, you can:

* Automate revenue sharing
* Maintain a transparent audit trail for settlements
* Track balances for each partner before actual payout

<Note>
  The **minimum split amount** per transaction is **1 GMD**.\
  Before a sub-account can receive a payout, it must have accumulated at least **10 GMD** in its balance. This ensures efficient settlement and reduces transaction costs.
</Note>

***

## Create a Sub-Account

Creates a new recipient account that can be used in split payments.

<CodeGroup>
  ```typescript nodejs theme={null}
  const subAccount = await modempay.subAccounts.create({
    business_name: "Hail-Ma",
    percentage: 10,             // Revenue share (integer %)
    settlement_code: "afrimoney", // Settlement provider (wave or afrimoney)
    account_number: 7012345,      // Account to receive funds
  });
  ```

  ```python python theme={null}
  sub_account = mp.sub_accounts.create(
      params={
          "business_name": "Hail-Ma",
          "percentage": 10,
          "settlement_code": "afrimoney",
          "account_number": 7012345,
      }
  )
  ```

  ```bash cURL theme={null}
  curl -X POST https://api.modempay.com/v1/sub-accounts \
    -H "Authorization: Bearer sk_test_..." \
    -H "Content-Type: application/json" \
    -d '{
        "business_name": "Hail-Ma",
        "percentage": 10,
        "settlement_code": "afrimoney",
        "account_number": 7012345,
      }'
  ```
</CodeGroup>

**Notes & Best Practices:**

* Ensure the `percentage` is appropriate; total splits should not exceed 100%.
* The `settlement_code` must match an active payment provider integrated with Modem Pay.
* Keep the `account_number` accurate to avoid failed settlements.
* You can create multiple sub-accounts and reuse them across payment intents.

## Retrieve a Sub-Account

Fetch details for a specific sub-account using its unique ID. Useful for confirming configuration or checking balances.

<CodeGroup>
  ```typescript nodejs theme={null}
  const subAccount = await modempay.subAccounts.retrieve("5bfcc08....810b");
  console.log(subAccount);
  ```

  ```python python theme={null}
  sub_account = mp.sub_accounts.retrieve("5bfcc08....810b")
  print(sub_account)
  ```

  ```bash cURL theme={null}
  curl -X GET https://api.modempay.com/v1/sub-accounts/5bfcc08....810b \
    -H "Authorization: Bearer sk_test_..." \
    -H "Content-Type: application/json"
  ```
</CodeGroup>

## List All Sub-Accounts

Get a list of all sub-accounts associated with your business. This is helpful for dashboards or automated scripts.

<CodeGroup>
  ```typescript nodejs theme={null}
  const allSubAccounts = await modempay.subAccounts.list();
  console.log(allSubAccounts);
  ```

  ```python python theme={null}
  all_sub_accounts = mp.sub_accounts.list()
  print(all_sub_accounts)
  ```

  ```bash cURL theme={null}
  curl -X GET https://api.modempay.com/v1/sub-accounts?term=""&limit=15&offset=0 \
    -H "Authorization: Bearer sk_test_..." \
    -H "Content-Type: application/json"
  ```
</CodeGroup>

**Notes:**

* Can be filtered by search term.
* Supports pagination using `offset` and `limit` parameters
* Returns pagination info if there are many sub-accounts.

## Update a Sub-Account

Modify a sub-account’s properties like percentage share or settlement destination.

<CodeGroup>
  ```typescript nodejs theme={null}
  const updatedSubAccount = await modempay.subAccounts.update("5bfcc08....810b", {
    percentage: 15,         // Update revenue share
    account_number: 7016789, // Update account number
  });
  console.log(updatedSubAccount);
  ```

  ```python python theme={null}
  updated_sub_account = mp.sub_accounts.update(
      "5bfcc08....810b",
      {
          "percentage": 15,         # Update revenue share
          "account_number": 7016789 # Update account number
      }
  )
  print(updated_sub_account)
  ```

  ```bash cURL theme={null}
  curl -X PUT https://api.modempay.com/v1/sub-accounts/5bfcc08....810b \
    -H "Authorization: Bearer sk_test_..." \
    -H "Content-Type: application/json" \
    -d '{
      "percentage": 15,
      "account_number": 7016789
    }'
  ```
</CodeGroup>

**Notes:**

* You can update the fields: `active`, `percentage`, `account_number`, and `settlement_code`.
* Updates take effect on future transactions, not on already processed ones.
* Avoid reducing percentages that would make total splits exceed 100%.

***

## Additional Tips

* **Balances:** Each sub-account maintains an internal balance until settlement occurs.
* **Audit:** Always store sub-account IDs and percentages used per payment intent to keep your records consistent.
* **Multiple Sub-Accounts:** Currently, a payment intent supports one sub-account. Future updates will allow multiple sub-accounts per transaction.

Initialize subaccount:> ## Documentation Index
> Fetch the complete documentation index at: https://docs.modempay.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Initialize Split Payment

Once you’ve created a sub-account, you can attach it to a **Payment Intent** so that a portion of the transaction is automatically routed to the sub-account during settlement.

### Example Usage

<CodeGroup>
  ```javascript nodejs theme={null}
  const paymentIntent = await modempay.paymentIntents.create({
    amount: 450,
    sub_account: "5bfcc08....810b" // Attach the sub-account ID here
  });
  console.log(paymentIntent);
  ```

  ```python python theme={null}
  payment_intent = modem_pay.payment_intents.create(params={
      "amount": 450,
      "sub_account": "5bfcc08....810b"  # Attach the sub-account ID here
  })
  print(payment_intent)
  ```

  ```bash cURL theme={null}
  cURL -X POST "https://api.modempay.com/v1/payments" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <your_api_key>" \
    -d '{
      "data": {
        "amount": 450,
        "sub_account": "5bfcc08....810b",
        "from_sdk": false
      }
    }'
  ```
</CodeGroup>

**Notes:**

* `sub_account` should be the ID of an existing sub-account you’ve created.
* The `percentage` defined on the sub-account determines how much of the payment is routed to that account.
* The remaining portion automatically goes to your main business account.
* Currently, each Payment Intent supports **one sub-account**. Future updates will allow multiple sub-accounts per transaction.

**Example Flow:**

1. Create a sub-account: `Moca`, 10% of transactions.
2. Create a Payment Intent for 450 GMD and attach `Moca` as the sub-account.
3. After the payment is processed:

   * Main account receives 405 GMD
   * Sub-account receives 45 GMD

This setup ensures **automatic, transparent revenue sharing** without manual calculations.
