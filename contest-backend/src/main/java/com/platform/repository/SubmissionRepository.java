package com.platform.repository;

import com.platform.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findByUserId(Long userId);
    List<Submission> findByContestId(Long contestId);
    List<Submission> findByProblemId(Long problemId);

    @Query("SELECT s FROM Submission s JOIN FETCH s.user JOIN FETCH s.problem WHERE s.contest.id = :contestId")
    List<Submission> findByContestIdWithUser(Long contestId);
}
