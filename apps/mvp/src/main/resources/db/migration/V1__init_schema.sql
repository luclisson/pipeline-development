--
-- PostgreSQL database dump
--


-- Dumped from database version 18.3 (Debian 18.3-1.pgdg13+1)
-- Dumped by pg_dump version 18.3 (Debian 18.3-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_table_access_method = heap;

--
-- Name: cart; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cart (
    cart_id bigint NOT NULL,
    session_id bigint,
    product_id bigint,
    amount_selected integer,
    status integer
);


--
-- Name: cart_cart_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cart_cart_id_seq
    AS bigint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cart_cart_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cart_cart_id_seq OWNED BY public.cart.cart_id;


--
-- Name: product; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product (
    product_id bigint NOT NULL,
    name character varying(50),
    description character varying(50),
    image_path character varying(255),
    price integer,
    amount_in_stock integer,
    tag character varying(50),
    public_id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_status integer DEFAULT 0
);


--
-- Name: product_product_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_product_id_seq
    AS bigint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_product_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.product_product_id_seq OWNED BY public.product.product_id;


--
-- Name: session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.session (
    session_id bigint NOT NULL,
    login_timestamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    analytics_id uuid
);


--
-- Name: session_session_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.session_session_id_seq
    AS bigint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: session_session_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.session_session_id_seq OWNED BY public.session.session_id;


--
-- Name: cart cart_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart ALTER COLUMN cart_id SET DEFAULT nextval('public.cart_cart_id_seq'::regclass);


--
-- Name: product product_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product ALTER COLUMN product_id SET DEFAULT nextval('public.product_product_id_seq'::regclass);


--
-- Name: session session_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session ALTER COLUMN session_id SET DEFAULT nextval('public.session_session_id_seq'::regclass);


--
-- Name: cart cart_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_pkey PRIMARY KEY (cart_id);


--
-- Name: product product_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_pkey PRIMARY KEY (product_id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (session_id);


--
-- Name: cart cart_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.product(product_id);


--
-- Name: cart cart_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.session(session_id);


--
-- PostgreSQL database dump complete
--


