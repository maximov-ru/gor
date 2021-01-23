package parser;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

@Component
@Transactional
public class ExecutableQueries {

    @PersistenceContext
    private EntityManager em;

    public void truncateSpeciality() {
        em.createNativeQuery("truncate table speciality").executeUpdate();
    }

}