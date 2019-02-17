import beans.Property;
import beans.SpiedService;
import com.intellij.lang.ecmascript6.psi.ES6Class;
import com.intellij.lang.javascript.psi.JSElement;
import com.intellij.lang.javascript.psi.JSFunction;
import com.intellij.lang.javascript.psi.ecmal4.JSClass;
import com.intellij.openapi.actionSystem.AnAction;
import com.intellij.openapi.actionSystem.AnActionEvent;
import com.intellij.openapi.actionSystem.LangDataKeys;
import com.intellij.openapi.actionSystem.PlatformDataKeys;
import com.intellij.openapi.editor.Caret;
import com.intellij.openapi.editor.Document;
import com.intellij.openapi.editor.Editor;
import com.intellij.openapi.fileEditor.FileEditor;
import com.intellij.openapi.project.Project;
import com.intellij.psi.PsiElement;
import com.intellij.psi.PsiExpressionStatement;
import com.intellij.psi.PsiFile;
import com.intellij.psi.util.PsiTreeUtil;
import org.apache.velocity.Template;
import org.apache.velocity.VelocityContext;
import org.apache.velocity.app.VelocityEngine;
import org.apache.velocity.runtime.RuntimeConstants;
import org.apache.velocity.runtime.resource.loader.ClasspathResourceLoader;


import java.io.StringWriter;
import java.util.Collection;
import java.util.List;

import static java.util.Arrays.asList;

public class GenerateTest extends AnAction {

    @Override
    public void actionPerformed(AnActionEvent e) {
        Project project = e.getProject();

        Editor editor = e.getData(PlatformDataKeys.EDITOR);
        FileEditor fileEditor = e.getData(PlatformDataKeys.FILE_EDITOR);
        Caret caret = e.getData(PlatformDataKeys.CARET);
        int offset = editor.getCaretModel().getOffset();
        PsiFile psiFile = e.getData(LangDataKeys.PSI_FILE);
        PsiElement element = psiFile.getOriginalElement();
        Collection<JSElement> childrenOfType = PsiTreeUtil.findChildrenOfType(element, JSElement.class);
        childrenOfType.forEach(child -> PsiTreeUtil.findChildrenOfType(child, JSFunction.class));
        Document document = editor.getDocument();
//        WriteCommandAction.runWriteCommandAction(project, () -> {
//            String content = getContent(fileEditor.getFile().getNameWithoutExtension().replaceFirst(".spec", ""),
//                                        getSpiedServices(),
//                                        getProperties());
//            document.insertString(caret.getSelectionEnd(), content);
//            caret.moveToOffset(caret.getSelectionEnd() + 4);
//        });
    }

    private String getContent(String componentName, List<SpiedService> spiedServices, List<Property> properties) {
        VelocityEngine velocityEngine = new VelocityEngine();
        velocityEngine.setProperty(RuntimeConstants.RESOURCE_LOADER, "classpath");
        velocityEngine.setProperty("classpath.resource.loader.class", ClasspathResourceLoader.class.getName());
        velocityEngine.init();

        Template t = velocityEngine.getTemplate("templates/component.vm");

        VelocityContext context = new VelocityContext();
        context.put("componentName", componentName);
        context.put("spiedServices", spiedServices);
        context.put("properties", properties);

        StringWriter writer = new StringWriter();
        t.merge( context, writer );
        return writer.toString().replaceAll("\r", " ");
    }

    private List<SpiedService> getSpiedServices() {
        return asList(new SpiedService("organisationService", "get"),
                      new SpiedService("userService", "updateUserDetails"));
    }

    private List<Property> getProperties() {
        return asList(new Property("organisations", "array"),
                    new Property("orgName", "string"),
                    new Property("projectsCount", "number"),
                    new Property("project", "object"),
                    new Property("onPageChange", "callback"));
    }
}
