import {
  Navbar,
  NavbarContent,
  NavbarBrand,
  NavbarItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@nextui-org/react";
import IconLink from "./IconLink";
import Link from 'next/link';
import Image from 'next/image'
import {
  HomeIcon,
  MapIcon,
  QuestionMarkCircleIcon,
  InformationCircleIcon,
  BoltIcon,
} from "@heroicons/react/20/solid";

const Header = () => (
  <Navbar maxWidth="full" position="sticky" height="auto" isBordered>
    <NavbarContent className="hidden sm:flex basis-1/5 sm:basis-full" style={{ paddingTop: '16px', paddingBottom: '16px', paddingLeft: '32px'}} justify="start">
      <NavbarBrand>
        <Link href="/"> 
            <Image 
              src="/logo.svg"
              alt="Clean & Green Philly Logo"
              width={112} 
              height={67}
            />
        </Link>
      </NavbarBrand>
    </NavbarContent>

    <NavbarContent
      className="hidden sm:flex basis-1/5 sm:basis-full"
      justify="end"
    >
      {/* Find Properties */}
      <NavbarItem key="Find Properties">
        <IconLink icon={<MapIcon />} text="Find Properties" href="/map" />
      </NavbarItem>

      {/* Dropdown for Take Action */}
      <Dropdown>
        <DropdownTrigger>
          <Button size="md" className="flex items-center hover:text-blue-500 hover:underline bg-white">
            <BoltIcon className="h-6 w-6" aria-hidden="true" />
            Take Action
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="Take Action">
          <DropdownItem key="get-access">
            <Link href="/get-access">Get Access</Link>
          </DropdownItem>
          <DropdownItem key="transform-property">
            <Link href="/transform-property">Transform a Property</Link>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      {/* Dropdown for About */}
            <Dropdown>
        <DropdownTrigger>
          <Button size="md" className="flex items-center hover:text-blue-500 hover:underline bg-white">
            <InformationCircleIcon className="h-6 w-6" aria-hidden="true" />
            About
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="Overview">
          <DropdownItem key="about">
            <Link href="/about">Overview</Link>
          </DropdownItem>
          <DropdownItem key="methodology">
            <Link href="/methodology">Methodology</Link>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </NavbarContent>
  </Navbar>
);

export default Header;
