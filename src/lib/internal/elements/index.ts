import type { SvelteComponent } from "svelte";
import A from "./A.svelte";
import Address from "./Address.svelte";
import Article from "./Article.svelte";
import Aside from "./Aside.svelte";
import B from "./B.svelte";
import Bdi from "./Bdi.svelte";
import Bdo from "./Bdo.svelte";
import Blockquote from "./Blockquote.svelte";
import Button from "./Button.svelte";
import Cite from "./Cite.svelte";
import Code from "./Code.svelte";
import Data from "./Data.svelte";
import Datalist from "./Datalist.svelte";
import Div from "./Div.svelte";
import Em from "./Em.svelte";
import Footer from "./Footer.svelte";
import H1 from "./H1.svelte";
import H2 from "./H2.svelte";
import H3 from "./H3.svelte";
import H4 from "./H4.svelte";
import H5 from "./H5.svelte";
import H6 from "./H6.svelte";
import Header from "./Header.svelte";
import I from "./I.svelte";
import Li from "./Li.svelte";
import Main from "./Main.svelte";
import Nav from "./Nav.svelte";
import Ol from "./Ol.svelte";
import P from "./P.svelte";
import Section from "./Section.svelte";
import Span from "./Span.svelte";
import Strong from "./Strong.svelte";
import Ul from "./Ul.svelte";

const components = {
  "a": A,
  "address": Address,
  "article": Article,
  "aside": Aside,
  "b": B,
  "bdi": Bdi,
  "bdo": Bdo,
  "blockquote": Blockquote,
  "button": Button,
  "cite": Cite,
  "code": Code,
  "data": Data,
  "datalist": Datalist,
  "div": Div,
  "em": Em,
  "footer": Footer,
  "h1": H1,
  "h2": H2,
  "h3": H3,
  "h4": H4,
  "h5": H5,
  "h6": H6,
  "header": Header,
  "i": I,
  "li": Li,
  "main": Main,
  "nav": Nav,
  "ol": Ol,
  "p": P,
  "section": Section,
  "span": Span,
  "strong": Strong,
  "ul": Ul,
}

export type SupportedElement = keyof typeof components;
export type SupportedAs = SupportedElement | SvelteComponent;

export function getElementComponent(name: SupportedElement) {
  return components[name];
}
