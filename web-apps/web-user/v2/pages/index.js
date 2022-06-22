/* eslint-disable react/jsx-no-target-blank */
import React from "react";
import Link from "next/link";
import buildClient from '../api/build-client';

import Navbar from "../components/Navbars/AuthNavbar.js";
import FooterSmall from "../components/Footers/FooterSmall.js";
import Login from "./auth/login.js";
import Dashboard from "./admin/dashboard.js";

const IndexPage = ({ currentUser }) => {
  return currentUser ? 
  (
    <>
      <Navbar currentUser={currentUser} transparent />
      <main>
        <section className="relative w-full h-full py-40 min-h-screen">
          <div
            className="absolute top-0 w-full h-full bg-blueGray-800 bg-no-repeat bg-full"
            style={{
              backgroundImage: "url('/img/register_bg_2.png')",
            }}
          ></div>
          <Dashboard/>
          <FooterSmall absolute />
        </section>
      </main>
    </>
  )
  :
  (
    <>
      <Navbar currentUser={currentUser} transparent />
      <main>
        <section className="relative w-full h-full py-40 min-h-screen">
          <div
            className="absolute top-0 w-full h-full bg-blueGray-800 bg-no-repeat bg-full"
            style={{
              backgroundImage: "url('/img/register_bg_2.png')",
            }}
          ></div>
          <Login/>
          <FooterSmall absolute />
        </section>
      </main>
    </>
  );

}

IndexPage.getInitialProps = async context => {
  const client = buildClient(context);
  const {data} = await client.get('/v1/users/current-user');

  return data;
}

export default IndexPage;
