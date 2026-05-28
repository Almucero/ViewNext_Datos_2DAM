xquery version "1.0" encoding "utf-8";

(:: OracleAnnotationVersion "1.0" ::)

declare namespace ns1="http://osb.training.org/types";
(:: import schema at "../Schemas/partnerPayment.xsd" ::)
declare namespace ns2="http://www.oracle.com/soasample";
(:: import schema at "../Schemas/CanonicalOrder.xsd" ::)

declare variable $partnerPayment as element() (:: element(*, ns1:PaymentType) ::) external;

declare function local:transPayment($partnerPayment as element() (:: element(*, ns1:PaymentType) ::)) as element() (:: element(*, ns2:PaymentType) ::) {
    <ns2:PaymentType>
        <ns2:CardPaymentType>{fn:data($partnerPayment/ns1:CardPaymentType)}</ns2:CardPaymentType>
        <ns2:CardNum>{fn:data($partnerPayment/ns1:ccNumber)}</ns2:CardNum>
        <ns2:ExpireDate>{fn:data($partnerPayment/ns1:ExpireDate)}</ns2:ExpireDate>
        <ns2:CardName>{fn:data($partnerPayment/ns1:ccName)}</ns2:CardName>
        <ns2:BillingAddress>
            <ns2:FirstName>{fn:data($partnerPayment/ns1:BillingAddress/ns1:FirstName)}</ns2:FirstName>
            <ns2:LastName>{fn:data($partnerPayment/ns1:BillingAddress/ns1:LastName)}</ns2:LastName>
            {
                for $AddressLine in $partnerPayment/ns1:BillingAddress/ns1:AddressLine
                return 
                <ns2:AddressLine>{fn:data($partnerPayment/ns1:BillingAddress/ns1:AddressLine)}</ns2:AddressLine>
            }
            <ns2:City>{fn:data($partnerPayment/ns1:BillingAddress/ns1:City)}</ns2:City>
            <ns2:State>{fn:data($partnerPayment/ns1:BillingAddress/ns1:State)}</ns2:State>
            <ns2:ZipCode>{fn:data($partnerPayment/ns1:BillingAddress/ns1:ZipCode)}</ns2:ZipCode>
            <ns2:PhoneNumber>{fn:data($partnerPayment/ns1:BillingAddress/ns1:PhoneNumber)}</ns2:PhoneNumber></ns2:BillingAddress>
        {
            if ($partnerPayment/ns1:AuthorizationDate)
            then <ns2:AuthorizationDate>{fn:data($partnerPayment/ns1:AuthorizationDate)}</ns2:AuthorizationDate>
            else ()
        }
        {
            if ($partnerPayment/ns1:AuthorizationAmount)
            then <ns2:AuthorizationAmount>{fn:data($partnerPayment/ns1:AuthorizationAmount)}</ns2:AuthorizationAmount>
            else ()
        }
    </ns2:PaymentType>
};

local:transPayment($partnerPayment)
