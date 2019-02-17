package beans;

public class Property {

    private String name;
    private String type;

    public Property(String name, String type) {
        this.name = name;
        this.type = type;
    }

    public String getName() {
        return name;
    }

    public String getType() {
        return type;
    }

    @Override
    public String toString() {
        return "Property{" +
                "name='" + name + '\'' +
                ", type='" + type + '\'' +
                '}';
    }
}
