import { Accordion, AccordionItem, Button, Link, Image } from "@nextui-org/react";
import { get } from "http";


export default function GetAccessPage() {
  return (
    <div className="flex flex-col min-h-screen">
    <div className="container mx-auto pt-20">
    <h1 className="text-4xl font-bold mb-6">Request to Remove a Property Listing</h1>

    <p>
    If you represent a community organization or other stakeholder with a legitimate interest in a property listed on our dashboard, you may request its removal by <a href="mailto:cleanandgreenphl@gmail.com" className="text-primary">contacting us</a>. This option is intended to support community-driven initiatives, such as protecting local community gardens.
    <br></br>
    <br></br>
    In order to do this, please email us at <a href="mailto:cleanandgreenphl@gmail.com" className="text-primary">cleanandgreenphl@gmail.com</a>. Submit a detailed request for removal, including the specific address of the property and a thorough explanation of your reasons for requesting its removal. Documentation such as photos of the site in use are encouraged. We will review the reason for your request and respond as quickly as we can. In making our decision, we will consider whether we believe the request is reasonable and consistent with positive community impact and anti-gun violence initiatives.
    <br></br>
    <br></br>
    Our team reserves the right to make the final decision on whether a property will be removed from the dashboard. Please note that requests to remove properties solely for personal gain, such as protecting private parking spaces or assisting negligent property owners, will not be entertained. By submitting a request, you acknowledge and agree that the final decision rests with our team, and not all requests may result in the removal of a property listing.
    </p>

    </div>
    </div>
  );
}
