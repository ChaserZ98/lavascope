fn main() {
    // Rerun if app.yml changes
    println!("cargo:rerun-if-changed=locales/app.yml")
}
