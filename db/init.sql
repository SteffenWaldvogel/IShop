--
-- PostgreSQL database dump
--

\restrict Zvq3qwUcWg2pCTTPJZcLeHJ9v6VY03DMz6ifj8iX9RiBeeXhDEh9UTKOQJHLMQt

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2025-12-04 22:11:34

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 231 (class 1259 OID 16466)
-- Name: customeraddress; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customeraddress (
    customer_id integer NOT NULL,
    addresstype character varying(20) NOT NULL,
    street character varying(255) NOT NULL,
    house_nr character varying(20) NOT NULL,
    zip character varying(20) NOT NULL,
    city character varying(100) NOT NULL,
    country character varying(100) NOT NULL,
    additional_addressline character varying(255),
    address_id integer NOT NULL
);


ALTER TABLE public.customeraddress OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 16563)
-- Name: customeraddress_address_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.customeraddress_address_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customeraddress_address_id_seq OWNER TO postgres;

--
-- TOC entry 5091 (class 0 OID 0)
-- Dependencies: 235
-- Name: customeraddress_address_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.customeraddress_address_id_seq OWNED BY public.customeraddress.address_id;


--
-- TOC entry 220 (class 1259 OID 16390)
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    customer_id integer NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(50)
);


ALTER TABLE public.customers OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16389)
-- Name: customers_customer_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.customers_customer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customers_customer_id_seq OWNER TO postgres;

--
-- TOC entry 5092 (class 0 OID 0)
-- Dependencies: 219
-- Name: customers_customer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.customers_customer_id_seq OWNED BY public.customers.customer_id;


--
-- TOC entry 226 (class 1259 OID 16424)
-- Name: order_statuses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_statuses (
    status_id integer NOT NULL,
    name character varying(50) NOT NULL,
    description text
);


ALTER TABLE public.order_statuses OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16423)
-- Name: order_statuses_status_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_statuses_status_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_statuses_status_id_seq OWNER TO postgres;

--
-- TOC entry 5093 (class 0 OID 0)
-- Dependencies: 225
-- Name: order_statuses_status_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_statuses_status_id_seq OWNED BY public.order_statuses.status_id;


--
-- TOC entry 234 (class 1259 OID 16522)
-- Name: orderitems; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orderitems (
    order_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    CONSTRAINT orderitems_quantity_check CHECK ((quantity > 0))
);


ALTER TABLE public.orderitems OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 16486)
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    order_id integer NOT NULL,
    customer_id integer NOT NULL,
    payment_method_id integer NOT NULL,
    shipping_method_id integer NOT NULL,
    trackingnumber character varying(100),
    "time" timestamp with time zone DEFAULT now() NOT NULL,
    status_id integer NOT NULL,
    comment text,
    totalsum numeric(10,2) NOT NULL
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 16485)
-- Name: orders_order_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.orders_order_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_order_id_seq OWNER TO postgres;

--
-- TOC entry 5094 (class 0 OID 0)
-- Dependencies: 232
-- Name: orders_order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.orders_order_id_seq OWNED BY public.orders.order_id;


--
-- TOC entry 222 (class 1259 OID 16401)
-- Name: payment_methods; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_methods (
    payment_method_id integer NOT NULL,
    name character varying(50) NOT NULL,
    description text
);


ALTER TABLE public.payment_methods OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16400)
-- Name: payment_methods_payment_method_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payment_methods_payment_method_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payment_methods_payment_method_id_seq OWNER TO postgres;

--
-- TOC entry 5095 (class 0 OID 0)
-- Dependencies: 221
-- Name: payment_methods_payment_method_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payment_methods_payment_method_id_seq OWNED BY public.payment_methods.payment_method_id;


--
-- TOC entry 230 (class 1259 OID 16448)
-- Name: picturelinks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.picturelinks (
    picturelink_id integer NOT NULL,
    product_id integer NOT NULL,
    picturelink text NOT NULL,
    last_changed_at timestamp with time zone DEFAULT now() NOT NULL,
    last_changed_by character varying(100)
);


ALTER TABLE public.picturelinks OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16447)
-- Name: picturelinks_picturelink_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.picturelinks_picturelink_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.picturelinks_picturelink_id_seq OWNER TO postgres;

--
-- TOC entry 5096 (class 0 OID 0)
-- Dependencies: 229
-- Name: picturelinks_picturelink_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.picturelinks_picturelink_id_seq OWNED BY public.picturelinks.picturelink_id;


--
-- TOC entry 228 (class 1259 OID 16435)
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    product_id integer NOT NULL,
    price numeric(10,2) NOT NULL,
    description text,
    quantity integer DEFAULT 0 NOT NULL,
    productname character varying(255) NOT NULL
);


ALTER TABLE public.products OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16434)
-- Name: products_product_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.products_product_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_product_id_seq OWNER TO postgres;

--
-- TOC entry 5097 (class 0 OID 0)
-- Dependencies: 227
-- Name: products_product_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_product_id_seq OWNED BY public.products.product_id;


--
-- TOC entry 224 (class 1259 OID 16412)
-- Name: shipping_methods; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shipping_methods (
    shipping_method_id integer NOT NULL,
    name character varying(50) NOT NULL,
    cost numeric(10,2) NOT NULL,
    description text,
    code character varying(50)
);


ALTER TABLE public.shipping_methods OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16411)
-- Name: shipping_methods_shipping_method_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.shipping_methods_shipping_method_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shipping_methods_shipping_method_id_seq OWNER TO postgres;

--
-- TOC entry 5098 (class 0 OID 0)
-- Dependencies: 223
-- Name: shipping_methods_shipping_method_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.shipping_methods_shipping_method_id_seq OWNED BY public.shipping_methods.shipping_method_id;


--
-- TOC entry 4903 (class 2604 OID 16564)
-- Name: customeraddress address_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customeraddress ALTER COLUMN address_id SET DEFAULT nextval('public.customeraddress_address_id_seq'::regclass);


--
-- TOC entry 4895 (class 2604 OID 16393)
-- Name: customers customer_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers ALTER COLUMN customer_id SET DEFAULT nextval('public.customers_customer_id_seq'::regclass);


--
-- TOC entry 4898 (class 2604 OID 16427)
-- Name: order_statuses status_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_statuses ALTER COLUMN status_id SET DEFAULT nextval('public.order_statuses_status_id_seq'::regclass);


--
-- TOC entry 4904 (class 2604 OID 16489)
-- Name: orders order_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders ALTER COLUMN order_id SET DEFAULT nextval('public.orders_order_id_seq'::regclass);


--
-- TOC entry 4896 (class 2604 OID 16404)
-- Name: payment_methods payment_method_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_methods ALTER COLUMN payment_method_id SET DEFAULT nextval('public.payment_methods_payment_method_id_seq'::regclass);


--
-- TOC entry 4901 (class 2604 OID 16451)
-- Name: picturelinks picturelink_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.picturelinks ALTER COLUMN picturelink_id SET DEFAULT nextval('public.picturelinks_picturelink_id_seq'::regclass);


--
-- TOC entry 4899 (class 2604 OID 16438)
-- Name: products product_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN product_id SET DEFAULT nextval('public.products_product_id_seq'::regclass);


--
-- TOC entry 4897 (class 2604 OID 16415)
-- Name: shipping_methods shipping_method_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_methods ALTER COLUMN shipping_method_id SET DEFAULT nextval('public.shipping_methods_shipping_method_id_seq'::regclass);


--
-- TOC entry 4924 (class 2606 OID 16567)
-- Name: customeraddress customeraddress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customeraddress
    ADD CONSTRAINT customeraddress_pkey PRIMARY KEY (address_id);


--
-- TOC entry 4926 (class 2606 OID 16575)
-- Name: customeraddress customeraddress_unique_type_per_customer; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customeraddress
    ADD CONSTRAINT customeraddress_unique_type_per_customer UNIQUE (customer_id, addresstype);


--
-- TOC entry 4908 (class 2606 OID 16399)
-- Name: customers customers_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_email_key UNIQUE (email);


--
-- TOC entry 4910 (class 2606 OID 16397)
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (customer_id);


--
-- TOC entry 4918 (class 2606 OID 16433)
-- Name: order_statuses order_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_statuses
    ADD CONSTRAINT order_statuses_pkey PRIMARY KEY (status_id);


--
-- TOC entry 4930 (class 2606 OID 16530)
-- Name: orderitems orderitems_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orderitems
    ADD CONSTRAINT orderitems_pkey PRIMARY KEY (order_id, product_id);


--
-- TOC entry 4928 (class 2606 OID 16501)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (order_id);


--
-- TOC entry 4912 (class 2606 OID 16410)
-- Name: payment_methods payment_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_pkey PRIMARY KEY (payment_method_id);


--
-- TOC entry 4922 (class 2606 OID 16460)
-- Name: picturelinks picturelinks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.picturelinks
    ADD CONSTRAINT picturelinks_pkey PRIMARY KEY (picturelink_id);


--
-- TOC entry 4920 (class 2606 OID 16446)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (product_id);


--
-- TOC entry 4914 (class 2606 OID 16559)
-- Name: shipping_methods shipping_methods_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_methods
    ADD CONSTRAINT shipping_methods_code_key UNIQUE (code);


--
-- TOC entry 4916 (class 2606 OID 16422)
-- Name: shipping_methods shipping_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_methods
    ADD CONSTRAINT shipping_methods_pkey PRIMARY KEY (shipping_method_id);


--
-- TOC entry 4932 (class 2606 OID 16480)
-- Name: customeraddress customeraddress_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customeraddress
    ADD CONSTRAINT customeraddress_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id) ON DELETE CASCADE;


--
-- TOC entry 4937 (class 2606 OID 16531)
-- Name: orderitems orderitems_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orderitems
    ADD CONSTRAINT orderitems_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id) ON DELETE CASCADE;


--
-- TOC entry 4938 (class 2606 OID 16536)
-- Name: orderitems orderitems_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orderitems
    ADD CONSTRAINT orderitems_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id);


--
-- TOC entry 4933 (class 2606 OID 16502)
-- Name: orders orders_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id);


--
-- TOC entry 4934 (class 2606 OID 16507)
-- Name: orders orders_payment_method_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_payment_method_id_fkey FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(payment_method_id);


--
-- TOC entry 4935 (class 2606 OID 16512)
-- Name: orders orders_shipping_method_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_shipping_method_id_fkey FOREIGN KEY (shipping_method_id) REFERENCES public.shipping_methods(shipping_method_id);


--
-- TOC entry 4936 (class 2606 OID 16517)
-- Name: orders orders_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_status_id_fkey FOREIGN KEY (status_id) REFERENCES public.order_statuses(status_id);


--
-- TOC entry 4931 (class 2606 OID 16461)
-- Name: picturelinks picturelinks_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.picturelinks
    ADD CONSTRAINT picturelinks_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON DELETE CASCADE;


-- Completed on 2025-12-04 22:11:35

--
-- PostgreSQL database dump complete
--

\unrestrict Zvq3qwUcWg2pCTTPJZcLeHJ9v6VY03DMz6ifj8iX9RiBeeXhDEh9UTKOQJHLMQt

