"use client";

import { useGetProfileQuery } from "@/apis/authApi";
import { setLoading } from "@/store/authSlice";
import { useRouter } from "next/navigation";
import { PropsWithChildren, useEffect } from "react";
import Loader from "./loader";

const checkForRedirect = () => {
  const pagesToAvoidRedirect = [""];
  if (pagesToAvoidRedirect.includes(window.location.pathname)) return true;
};

const AuthCheck = (props: PropsWithChildren) => {
  const { isSuccess, isLoading, isError } = useGetProfileQuery({});
  const router = useRouter();
  useEffect(() => {
    if (isSuccess && checkForRedirect()) router.push("/dashboard");
    if (isError) router.push("/auth");
    setLoading(false);
  }, [isSuccess, isError, router]);

  if (isLoading) return <>{isLoading && <Loader />}</>;
  return <>{props.children}</>;
};

export default AuthCheck;
