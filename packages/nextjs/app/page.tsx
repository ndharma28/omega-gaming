"use client";

// This imports the Lottery component you created in the previous step
import LotteryDapp from "../components/lottery-dapp";
import type { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <>
      <LotteryDapp />
    </>
  );
};

export default Home;
