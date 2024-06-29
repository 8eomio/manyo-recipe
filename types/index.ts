import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export type refri = {
  id: string;
  ingredient: string;
  exp_date: Date;
  usrid: string;
}

// types/index.ts
export type recipe = {
  id: string;
  title: string;
  required_ingredients: string[];
  difficulty: string;
  comments: string;
  dish_name: string;
  time: number;
  seasoning: string;
  optional_ingredients: string;
  author: string;
  all_ingredients: string[];
  cooking_steps: string[];
  cooking_step_images: string[];
  utensils: string;
  views: number;
  userid: string;
  main_img: string;
}
