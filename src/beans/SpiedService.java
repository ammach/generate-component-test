package beans;

public class SpiedService {

    private String name;
    private String method;

    public SpiedService(String name, String method) {
        this.name = name;
        this.method = method;
    }

    public String getName() {
        return name;
    }

    public String getMethod() {
        return method;
    }

    @Override
    public String toString() {
        return "SpiedService{" +
                "name='" + name + '\'' +
                ", method='" + method + '\'' +
                '}';
    }
}
