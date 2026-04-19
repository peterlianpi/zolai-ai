// CSS Module
declare module "*.module.css" {
  const classes: {
    readonly [key: string]: string;
  };
  export default classes;
}

// Global CSS
declare module "*.css" {
  const content: string;
  export default content;
}
